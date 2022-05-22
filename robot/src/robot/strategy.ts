import { Criteria, Data, Metric } from './criteria'
import { Node, Params } from './node'

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

  eval(data: Data): TickResult {
    const buyResult = this.buy.eval(data)
    const sellResult = this.sell.eval(data)

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
      request: request,
      metrics: [...buyResult.metrics, ...sellResult.metrics],
    }
  }

  remove(criteriaId: string) {
    return new Strategy(this.buy.remove(criteriaId), this.sell.remove(criteriaId))
  }

  replace(criteriaId: string, criteria: Criteria, params: Params) {
    return new Strategy(this.buy.replace(criteriaId, criteria, params), this.sell.replace(criteriaId, criteria, params))
  }
}
