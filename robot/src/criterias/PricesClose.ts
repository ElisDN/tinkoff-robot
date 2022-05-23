import { Criteria, Schema } from '../robot/criteria'
import { Data, Result } from '../robot/trading'

class PricesClose implements Criteria {
  getSchema(): Schema {
    return {
      type: 'prices-close',
      name: 'Цены закрытия',
      multiple: true,
      params: [],
      inputs: [],
    }
  }

  eval(id: string, data: Data): Result {
    const prices = Object.entries(data.candles)
      .map(([, candle]) => candle)
      .filter((candle) => candle.isComplete)
      .map((candle) => candle.close)

    return new Result(prices, [])
  }
}

export default PricesClose
