import { Criteria, Result, Schema } from '../robot/criteria'
import { Inputs, Params } from '../robot/node'
import { Data } from '../robot/trading'

class Greater implements Criteria {
  getSchema(): Schema {
    return {
      type: 'greater',
      name: 'Больше',
      multiple: false,
      params: [],
      inputs: [
        {
          type: 'that',
          name: 'что',
          multiple: false,
        },
        {
          type: 'than',
          name: 'чего',
          multiple: false,
        },
      ],
    }
  }

  eval(id: string, data: Data, params: Params, inputs: Inputs): Result {
    const that = inputs.get('that', data)
    const than = inputs.get('than', data)
    return new Result(that.value > than.value ? 1 : 0, [...that.metrics, ...than.metrics])
  }
}

export default Greater
