import { Criteria, Result, Schema } from '../robot/criteria'
import { Inputs, Params } from '../robot/node'
import { Data } from '../robot/trading'

class Not implements Criteria {
  getSchema(): Schema {
    return {
      type: 'not',
      name: 'Не',
      multiple: false,
      params: [],
      inputs: [
        {
          type: 'that',
          name: 'что',
          multiple: false,
        },
      ],
    }
  }

  eval(id: string, data: Data, params: Params, inputs: Inputs): Result {
    const that = inputs.get('that', data)
    return new Result(!that.value ? 1 : 0, that.metrics)
  }
}

export default Not
