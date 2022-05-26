import { Criteria } from './criteria'
import { Node, Params } from './node'
import { Data, Metric } from './trading'

export class OrderRequest {
  constructor(public readonly buy: boolean) {}

  static buy() {
    return new OrderRequest(true)
  }

  static sell() {
    return new OrderRequest(false)
  }
}

export type EvalResult = {
  request: OrderRequest | null
  metrics: Metric[]
}

export class Strategy {
  public readonly buy: Node
  public readonly sell: Node

  constructor(buy: Node, sell: Node) {
    this.buy = buy
    this.sell = sell
  }

  static blank() {
    return new Strategy(Node.forNone(), Node.forNone())
  }

  eval(data: Data): EvalResult {
    const sellResult = this.sell.eval(data)
    const buyResult = this.buy.eval(data)

    const isNeededSell = (!data.order || data.order.buy) && sellResult.value
    const isNeededBuy = (!data.order || !data.order.buy) && buyResult.value

    let request: OrderRequest | null = null

    if (isNeededSell) {
      request = OrderRequest.sell()
    } else if (isNeededBuy) {
      request = OrderRequest.buy()
    }

    return {
      request: request,
      metrics: [...sellResult.metrics, ...buyResult.metrics],
    }
  }

  remove(criteriaId: string) {
    return new Strategy(this.buy.remove(criteriaId), this.sell.remove(criteriaId))
  }

  replace(criteriaId: string, criteria: Criteria, params: Params) {
    return new Strategy(this.buy.replace(criteriaId, criteria, params), this.sell.replace(criteriaId, criteria, params))
  }

  wrap(criteriaId: string, criteria: Criteria) {
    return new Strategy(this.buy.wrap(criteriaId, criteria), this.sell.wrap(criteriaId, criteria))
  }
}
