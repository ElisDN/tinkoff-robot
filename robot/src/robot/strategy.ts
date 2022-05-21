import { Criteria, Data, Metric, Result } from './criteria'
import None from '../criterias/None'

export class OrderRequest {
  constructor(public readonly buy: boolean) {}

  static buy() {
    return new OrderRequest(true)
  }

  static sell() {
    return new OrderRequest(false)
  }
}

export type TickResult = {
  orderRequest: OrderRequest | null
  metrics: Metric[]
}

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

  eval(data: Data): TickResult {
    const buyResult = this.buy.eval(data, Result.blank())
    const sellResult = this.sell.eval(data, Result.blank())

    const isNeededBuy = (!data.order || !data.order.buy) && buyResult.value
    const isNeededSell = data.order && data.order.buy && sellResult.value

    let request: OrderRequest | null = null

    if (isNeededBuy) {
      request = OrderRequest.buy()
    }

    if (isNeededSell) {
      request = OrderRequest.sell()
    }

    return {
      orderRequest: request,
      metrics: [...buyResult.metrics, ...sellResult.metrics],
    }
  }

  without(criteriaId: string) {
    return new Strategy(this.buy.without(criteriaId), this.sell.without(criteriaId))
  }

  with(criteriaId: string, criteria: Criteria) {
    return new Strategy(this.buy.with(criteriaId, criteria), this.sell.with(criteriaId, criteria))
  }
}
