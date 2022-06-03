import { Strategy, EvalResult } from './strategy'
import { Data, Services } from './trading'
import { v4 } from 'uuid'
import { Order } from '../services/orders'
import { Candle } from '../services/candles'
import { Instrument } from '../services/instruments'

class Robot {
  private readonly id: string
  private name: string
  private readonly accountId: string
  private figi: string
  private lots: number
  private strategy: Strategy
  private active: boolean
  private startDate: Date | null

  constructor(
    id: string,
    name: string,
    accountId: string,
    figi: string,
    lots: number,
    strategy: Strategy,
    active: boolean,
    startDate: Date | null
  ) {
    this.id = id
    this.name = name
    this.accountId = accountId
    this.figi = figi
    this.lots = lots
    this.strategy = strategy
    this.active = active
    this.startDate = startDate
  }

  tick(data: Data): EvalResult {
    return this.strategy.eval(data)
  }

  async backTest(services: Services, from: Date) {
    const cacheKey = 'backtest-' + this.id + '-' + this.figi

    const cached = await services.cache.getItem<Promise<[Candle[], Instrument, Order[]]>>(cacheKey)

    const [candles, instrument] =
      cached ||
      (await Promise.all([
        services.candles.getHistory(this.figi, from, new Date()),
        services.instruments.getByFigi(this.figi),
      ]))

    await services.cache.setItem(cacheKey, [candles, instrument], { ttl: 60 })

    const comission = 0.0004
    const results = []

    let data = Data.blank(new Date())

    let order: Order | null

    data = data.withOrder({
      id: v4(),
      figi: this.figi,
      date: new Date(),
      buy: false,
      lots: this.lots,
      price: 0,
      comission: 0,
    })

    for (const candle of candles) {
      data = data.withCandle(candle)

      const result = this.tick(data)

      if (result.request) {
        order = {
          id: v4(),
          figi: this.figi,
          date: candle.time,
          buy: result.request.buy,
          lots: this.lots,
          price: candle.close,
          comission: candle.close * this.lots * instrument.lot * comission,
        }
        data = data.withOrder(order)
      } else {
        order = null
      }

      results.push({
        eval: result,
        candle,
        order,
      })
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const resultOrders = results.filter((result) => result.order !== null).map<Order>((result) => result.order)

    const total = resultOrders
      .map((order) => {
        return (order.price || 0) * order.lots * instrument.lot
      })
      .reduce((a, b) => a + b, 0)

    const comissions = total * comission

    const startCost = (candles.at(0)?.close || 0) * instrument.lot * this.lots
    const endCost = (candles.at(-1)?.close || 0) * instrument.lot * this.lots

    const tradingPofit = resultOrders
      .map((order) => {
        const cost = (order.price || 0) * order.lots * instrument.lot
        return (order.buy ? -cost : cost) - (order.comission || 0)
      })
      .reduce((a, b) => a + b, 0)

    const lastOrder = resultOrders.at(-1)
    const tradingEndPofit = lastOrder && lastOrder.buy ? tradingPofit + endCost : tradingPofit

    return {
      ticks: results,
      summary: {
        lots: this.lots,
        instrumentLots: instrument.lot,
        startCost,
        endCost,
        diffProfit: (endCost - startCost) * this.lots,
        ordersCount: resultOrders.length,
        total,
        comissions,
        tradingPofit,
        tradingEndPofit,
      },
    }
  }

  async trade(services: Services) {
    if (!this.active) {
      throw new Error('Робот не активирован')
    }

    await services.logger.info('Запуск робота', {
      robot: this.id,
      name: this.name,
      accountId: this.accountId,
      figi: this.figi,
    })

    const account = await services.accounts.get(this.accountId)

    await services.logger.info('Загружен счёт', { robot: this.id, account })

    const instrument = await services.instruments.getByFigi(this.figi)

    await services.logger.info('Получен инструмент', { robot: this.id, instrument })

    if (!instrument.available) {
      await services.logger.info('Инструмент недоступен', { robot: this.id, instrument })
      throw new Error('Инструмент ' + instrument.figi + ' недоступен')
    }

    const from = new Date()
    from.setDate(from.getDate() - 4)

    const candles = await services.candles.getHistory(this.figi, from, new Date())
    await services.logger.info('Загружены свечи', { robot: this.id })

    const orders = await services.orders.getAllNew(account, this.figi)
    await services.logger.info('Загружены активные заказы', { robot: this.id })

    const operations = await services.operations.getAllExecuted(account, this.figi, from, new Date())

    await services.logger.info('Загружены прошлые операции', { robot: this.id })

    let data = Data.blank(new Date())

    const existingOrder = orders.at(-1)
    if (existingOrder) {
      await services.logger.info('Имеется активный заказ', { robot: this.id, order: existingOrder })
      data = data.withOrder(existingOrder)
    } else {
      const existingOperation = operations.at(-1)
      if (existingOperation) {
        await services.logger.info('Имеется прошлая операция', { robot: this.id, operation: existingOperation })
        data = data.withOrder({
          id: existingOperation.id,
          date: existingOperation.date,
          price: existingOperation.price,
          figi: existingOperation.figi,
          buy: existingOperation.buy,
          lots: existingOperation.lots,
          comission: 0,
        })
      }
    }

    let order: Order | null

    for (const candle of candles) {
      data = data.withCandle(candle)
    }

    await services.logger.info('Подписываемся на свечи', { robot: this.id, figi: this.figi })

    const stream = services.market.subscribeToCandles(this.figi)

    for await (const candle of stream) {
      if (!this.active) {
        break
      }

      await services.logger.info('Получена свеча', { robot: this.id, figi: this.figi, candle })

      data = data.withCandle(candle)
      const result = this.tick(data)

      await services.logger.info('Вычислен результат', { robot: this.id, figi: this.figi, result })

      if (result.request) {
        if (result.request.buy) {
          let availableMoney = 0
          try {
            availableMoney = await services.portfolio.getAvailableMoney(account, instrument.currency)
            await services.logger.info('Доступно денег', { robot: this.id, available: availableMoney })
          } catch (e) {
            await services.logger.error('Ошибка', { robot: this.id, error: e })
          }
          if (availableMoney > candle.close * this.lots * instrument.lot) {
            await services.logger.info('Отправляем заказ на покупку', {
              robot: this.id,
              order: { account: this.accountId, figi: this.figi, buy: result.request.buy, lots: this.lots },
            })
            try {
              order = await services.orders.postOrder(account, this.figi, result.request.buy, this.lots)
              data = data.withOrder(order)
            } catch (e) {
              await services.logger.error('Ошибка', { robot: this.id, error: e })
            }
          } else {
            await services.logger.info('Недостаточно средств для заказа', {
              robot: this.id,
              order: { account: this.accountId, figi: this.figi, buy: result.request.buy, lots: this.lots },
            })
          }
        } else {
          let availableLots = 0
          try {
            availableLots = await services.portfolio.getAvailableLots(account, this.figi)
            await services.logger.info('Доступно лотов', { robot: this.id, available: availableLots })
          } catch (e) {
            await services.logger.error('Ошибка', { robot: this.id, error: e })
          }
          if (availableLots >= this.lots) {
            await services.logger.info('Отправляем заказ на продажу', {
              robot: this.id,
              order: { account: this.accountId, figi: this.figi, buy: result.request.buy, lots: this.lots },
            })
            try {
              order = await services.orders.postOrder(account, this.figi, result.request.buy, this.lots)
              data = data.withOrder(order)
            } catch (e) {
              await services.logger.error('Ошибка', { robot: this.id, error: e })
            }
          } else {
            await services.logger.info('Недостаточно лотов для продажи', {
              robot: this.id,
              order: { account: this.accountId, figi: this.figi, buy: result.request.buy, lots: this.lots },
            })
          }
        }
      }
    }

    await services.logger.info('Остановка робота', { robot: this.id })
  }

  start(date: Date) {
    this.active = true
    this.startDate = date
  }

  stop() {
    this.active = false
    this.startDate = null
  }

  edit(name: string, figi: string, lots: number) {
    this.name = name
    this.figi = figi
    this.lots = lots
  }

  changeStrategy(strategy: Strategy): void {
    this.strategy = strategy
  }

  getId(): string {
    return this.id
  }

  getAccountId(): string {
    return this.accountId
  }

  getFigi(): string {
    return this.figi
  }

  getLots(): number {
    return this.lots
  }

  getName(): string {
    return this.name
  }

  getStrategy(): Strategy {
    return this.strategy
  }

  isActive(): boolean {
    return this.active
  }

  getStartDate(): Date | null {
    return this.startDate
  }
}

export default Robot
