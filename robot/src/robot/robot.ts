class Robot {
  private readonly id: string
  private readonly accountId: string
  private readonly figi: string

  constructor(id: string, accountId: string, figi: string) {
    this.id = id
    this.accountId = accountId
    this.figi = figi
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
}

export default Robot
