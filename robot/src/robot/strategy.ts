import { Criteria } from './criteria'
import None from './criterias/None'

export class Strategy {
  public readonly sell: Criteria
  public readonly buy: Criteria

  constructor(buy: Criteria, sell: Criteria) {
    this.sell = sell
    this.buy = buy
  }

  static blank() {
    return new Strategy(new None(), new None())
  }
}
