export interface Criteria {
  readonly type: string
  readonly name: string
  evaluate(): number | number[] | boolean
}

export class Strategy {
  public readonly sell: Criteria | null
  public readonly buy: Criteria | null

  constructor(buy: Criteria | null, sell: Criteria | null) {
    this.sell = sell
    this.buy = buy
  }
}
