import { Criteria, Schema } from '../robot/criteria'
import { Data, Result } from '../robot/trading'

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
    const price = data.candle ? data.candle.close : null
    return new Result(price, [])
  }
}

export default Price
