export interface Criteria {
  readonly type: string
  readonly name: string
  evaluate(): number | number[] | boolean
}

export class NoneCriteria implements Criteria {
  public readonly type: string = 'none'
  public readonly name: string = 'Нет'
  evaluate(): number | number[] | boolean {
    return false
  }
}

export class Strategy {
  public readonly sell: Criteria
  public readonly buy: Criteria

  constructor(buy: Criteria, sell: Criteria) {
    this.sell = sell
    this.buy = buy
  }
}
