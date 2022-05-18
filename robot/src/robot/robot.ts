class Robot {
  private readonly accountId: string
  private readonly figi: string

  constructor(accountId: string, figi: string) {
    this.accountId = accountId
    this.figi = figi
  }

  isFor(accountId: string, figi: string): boolean {
    return this.accountId === accountId && this.figi === figi
  }

  getAccountId(): string {
    return this.accountId
  }

  getFigi(): string {
    return this.figi
  }
}

export default Robot
