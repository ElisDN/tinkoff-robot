import { NoneCriteria, Strategy } from './strategy'

class Robot {
  private readonly id: string
  private readonly accountId: string
  private readonly figi: string
  private strategy: Strategy

  constructor(id: string, accountId: string, figi: string) {
    this.id = id
    this.accountId = accountId
    this.figi = figi
    this.strategy = new Strategy(new NoneCriteria(), new NoneCriteria())
  }

  isFor(accountId: string, figi: string): boolean {
    return this.accountId === accountId && this.figi === figi
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
