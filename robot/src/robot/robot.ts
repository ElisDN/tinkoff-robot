import { Strategy, EvalResult } from './strategy'
import { Data, Trader } from './trading'
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

  constructor(
    id: string,
    name: string,
    accountId: string,
    figi: string,
    lots: number,
    strategy: Strategy,
    active: boolean
  ) {
    this.id = id
    this.name = name
    this.accountId = accountId
    this.figi = figi
    this.lots = lots
    this.strategy = strategy
    this.active = active
  }

  tick(data: Data): EvalResult {
    return this.strategy.eval(data)
  }

  async backTest(trader: Trader, from: Date) {
    const account = await trader.accounts.get(this.accountId)

    const cacheKey = 'backtest-' + this.id + '-' + this.figi

    const cached = await trader.cache.getItem<Promise<[Candle[], Instrument, Order[]]>>(cacheKey)

    const [candles, instrument, orders] =
      cached ||
      (await Promise.all([
        trader.candles.getHistory(this.figi, from, new Date()),
        trader.instruments.getByFigi(this.figi),
        trader.orders.getAllNew(account, this.figi),
      ]))

    await trader.cache.setItem(cacheKey, [candles, instrument, orders], { ttl: 60 })

    const comission = 0.003

    const results = []

    let data = Data.blank(new Date())

    let order: Order | null
    order = orders.at(-1) || null

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

  start() {
    this.active = true
  }

  stop() {
    this.active = false
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
}

export default Robot
