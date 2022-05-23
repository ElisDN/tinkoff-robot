import { Strategy, EvalResult } from './strategy'
import { Data, TickResult, Trader } from './trading'
import { v4 } from 'uuid'

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

  async backTest(trader: Trader, from: Date): Promise<TickResult[]> {
    const candles = await trader.candles.getHistory(this.figi, from, new Date())
    const results: TickResult[] = []
    let data = Data.blank(new Date())

    for (const candle of candles) {
      data = data.withCandle(candle)

      const result = this.tick(data)
      results.push({
        eval: result,
        candle,
      })

      if (result.request) {
        data = data.withOrder({
          id: v4(),
          date: candle.time,
          buy: result.request.buy,
          lots: 1,
          price: candle.close,
        })
      }
    }

    return results
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
