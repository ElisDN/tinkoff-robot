import { Criteria, Schema } from '../robot/criteria'
import { Data, Metric, Result } from '../robot/trading'

class LastBuyPrice implements Criteria {
  getSchema(): Schema {
    return {
      type: 'last-buy-price',
      name: 'Цена покупки',
      multiple: false,
      params: [],
      inputs: [],
    }
  }

  eval(id: string, data: Data): Result {
    if (!data.order) {
      return new Result(null, [])
    }
    if (!data.order.buy) {
      return new Result(null, [])
    }
    return new Result(data.order.price, [new Metric(id, 'Цена покупки', data.order.price)])
  }
}

export default LastBuyPrice
