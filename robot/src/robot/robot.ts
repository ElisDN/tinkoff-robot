import { Strategy, EvalResult } from './strategy'
import { Data, Trader } from './trading'
import { v4 } from 'uuid'
import { Order } from '../services/orders'

class Robot {
  private readonly id: string
  private name: string
  private readonly accountId: string
  private figi: string
  private strategy: Strategy

  constructor(id: string, name: string, accountId: string, figi: string, strategy: Strategy) {
    this.id = id
    this.name = name
    this.accountId = accountId
    this.figi = figi
    this.strategy = strategy
  }

  tick(data: Data): EvalResult {
    return this.strategy.eval(data)
  }

  async backTest(trader: Trader, from: Date) {
    const account = await trader.accounts.get(this.accountId)
    const candles = await trader.candles.getHistory(this.figi, from, new Date())
    const instrument = await trader.instruments.getByFigi(this.figi)
    const orders = await trader.orders.getAllNew(account, this.figi)
    const lots = 1
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
          lots,
          price: candle.close,
          comission: candle.close * lots * instrument.lot * comission,
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

    const startCost = (candles.at(0)?.close || 0) * instrument.lot * lots
    const endCost = (candles.at(-1)?.close || 0) * instrument.lot * lots

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
        lots,
        instrumentLots: instrument.lot,
        startCost,
        endCost,
        diffProfit: (endCost - startCost) * lots,
        ordersCount: resultOrders.length,
        total,
        comissions,
        tradingPofit,
        tradingEndPofit,
      },
    }
  }

  edit(name: string, figi: string) {
    this.name = name
    this.figi = figi
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

  getName(): string {
    return this.name
  }

  getStrategy(): Strategy {
    return this.strategy
  }
}

export default Robot
