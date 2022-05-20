import { Criteria } from './criteria'
import Less from './criterias/Less'
import Price from './criterias/Price'
import Static from './criterias/Static'
import Greater from './criterias/Greater'

export class Strategy {
  public readonly buy: Criteria
  public readonly sell: Criteria

  constructor(buy: Criteria, sell: Criteria) {
    this.buy = buy
    this.sell = sell
  }

  static example() {
    return new Strategy(new Less(new Price(), new Static(100)), new Greater(new Price(), new Static(200)))
  }

  without(criteriaId: string) {
    return new Strategy(this.buy.without(criteriaId), this.sell.without(criteriaId))
  }
}
