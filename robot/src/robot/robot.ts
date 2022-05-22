import { Strategy, TickResult } from './strategy'
import { Data } from './trading'

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

  tick(data: Data): TickResult {
    return this.strategy.eval(data)
  }

  is(accountId: string, id: string): boolean {
    return this.accountId === accountId && this.id === id
  }

  isFor(accountId: string, figi: string): boolean {
    return this.accountId === accountId && this.figi === figi
  }

  isForAccount(accountId: string) {
    return this.accountId === accountId
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
