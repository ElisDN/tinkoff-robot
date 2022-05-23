import { Criteria, Schema } from '../robot/criteria'
import { Data, Metric, Result } from '../robot/trading'

class LastSellPrice implements Criteria {
  getSchema(): Schema {
    return {
      type: 'last-sell-price',
      name: 'Цена продажи',
      multiple: false,
      params: [],
      inputs: [],
    }
  }

  eval(id: string, data: Data): Result {
    if (!data.order) {
      return new Result(null, [])
    }
    if (data.order.buy) {
      return new Result(null, [])
    }
    return new Result(data.order.price, [new Metric(id, 'Цена продажи', data.order.price)])
  }
}

export default LastSellPrice
