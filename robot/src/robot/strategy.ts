import { Criteria } from './criteria'
import None from './criterias/None'

export class Strategy {
  public readonly buy: Criteria
  public readonly sell: Criteria

  constructor(buy: Criteria, sell: Criteria) {
    this.buy = buy
    this.sell = sell
  }

  static blank() {
    return new Strategy(new None(), new None())
  }

  without(criteriaId: string) {
    return new Strategy(this.buy.without(criteriaId), this.sell.without(criteriaId))
  }

  with(criteriaId: string, criteria: Criteria) {
    return new Strategy(this.buy.with(criteriaId, criteria), this.sell.with(criteriaId, criteria))
  }
}
