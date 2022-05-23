import { Strategy, EvalResult } from './strategy'
import { Data, Order, Trader } from './trading'
import { v4 } from 'uuid'
import logging from '../sdk/middleware/logging'

class Robot {
  private readonly id: string
  private readonly name: string
  private readonly accountId: string
  private readonly figi: string
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
    const candles = await trader.candles.getHistory(this.figi, from, new Date())
    const instrument = await trader.instruments.getByFigi(this.figi)
    const lots = 1

    const results = []
    let data = Data.blank(new Date())
    let order: Order | null = null

    for (const candle of candles) {
      data = data.withCandle(candle)

      const result = this.tick(data)

      if (result.request) {
        order = {
          id: v4(),
          date: candle.time,
          buy: result.request.buy,
          lots,
          price: candle.close,
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
    const orders = results.filter((result) => result.order !== null).map<Order>((result) => result.order)

    const total = orders
      .map((order) => {
        return order.price * order.lots * instrument.lot
      })
      .reduce((a, b) => a + b, 0)

    const comission = 0.003
    const comissions = total * comission

    const startCost = (candles.at(0)?.close || 0) * instrument.lot * lots
    const endCost = (candles.at(-1)?.close || 0) * instrument.lot * lots

    const tradingPofit = orders
      .map((order) => {
        const cost = order.price * order.lots * instrument.lot
        return (order.buy ? -cost : cost) - cost * comission
      })
      .reduce((a, b) => a + b, 0)

    const lastOrder = orders.at(-1)
    const tradingEndPofit = lastOrder && lastOrder.buy ? tradingPofit + endCost : tradingPofit

    return {
      ticks: results,
      summary: {
        lots,
        instrumentLots: instrument.lot,
        startCost,
        endCost,
        diffProfit: (endCost - startCost) * lots,
        ordersCount: orders.length,
        total,
        comissions,
        tradingPofit,
        tradingEndPofit,
      },
    }
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
