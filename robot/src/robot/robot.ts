import { Strategy } from './strategy'

class Robot {
  private readonly id: string
  private readonly accountId: string
  private readonly figi: string
  private strategy: Strategy

  constructor(id: string, accountId: string, figi: string, strategy: Strategy) {
    this.id = id
    this.accountId = accountId
    this.figi = figi
    this.strategy = strategy
  }

  is(accountId: string, id: string): boolean {
    return this.accountId === accountId && this.id === id
  }

  isFor(accountId: string, figi: string): boolean {
    return this.accountId === accountId && this.figi === figi
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

  getStrategy(): Strategy {
    return this.strategy
  }
}

export default Robot
