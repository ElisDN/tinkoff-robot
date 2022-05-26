import { Criteria, Schema } from '../robot/criteria'
import { Data, Result } from '../robot/trading'

class PricesHigh implements Criteria {
  getSchema(): Schema {
    return {
      type: 'prices-high',
      name: 'Цены верхние',
      multiple: true,
      params: [],
      inputs: [],
    }
  }

  eval(id: string, data: Data): Result {
    const prices = Object.entries(data.candles)
      .map(([, candle]) => candle)
      .filter((candle) => candle.isComplete)
      .map((candle) => candle.high)

    return new Result(prices, [])
  }
}

export default PricesHigh
