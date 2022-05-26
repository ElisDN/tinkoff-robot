import { Criteria, Schema } from '../robot/criteria'
import { Data, Result } from '../robot/trading'

class PricesLow implements Criteria {
  getSchema(): Schema {
    return {
      type: 'prices-low',
      name: 'Цены нижние',
      multiple: true,
      params: [],
      inputs: [],
    }
  }

  eval(id: string, data: Data): Result {
    const prices = Object.entries(data.candles)
      .map(([, candle]) => candle)
      .filter((candle) => candle.isComplete)
      .map((candle) => candle.low)

    return new Result(prices, [])
  }
}

export default PricesLow
