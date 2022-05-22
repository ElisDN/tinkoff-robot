import { Criteria, Schema } from '../robot/criteria'
import { Inputs, Params } from '../robot/node'
import { Data, Result } from '../robot/trading'

class Less implements Criteria {
  getSchema(): Schema {
    return {
      type: 'less',
      name: 'Меньше',
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
    return new Result(that.value < than.value ? 1 : 0, [...that.metrics, ...than.metrics])
  }
}

export default Less
