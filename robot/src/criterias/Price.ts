import { Criteria, Result, Schema } from '../robot/criteria'
import { Data, Metric } from '../robot/trading'

class Price implements Criteria {
  getSchema(): Schema {
    return {
      type: 'price',
      name: 'Цена',
      multiple: false,
      params: [],
      inputs: [],
    }
  }

  eval(id: string, data: Data): Result {
    return new Result(data.price, [new Metric(id, 'Цена', data.price)])
  }
}

export default Price
