import { Criteria, Result, Schema } from '../robot/criteria'
import { Inputs, Params } from '../robot/node'
import { Data } from '../robot/trading'

class Or implements Criteria {
  getSchema(): Schema {
    return {
      type: 'or',
      name: 'Или',
      multiple: false,
      params: [],
      inputs: [
        {
          type: 'one',
          name: 'что',
          multiple: false,
        },
        {
          type: 'two',
          name: 'что',
          multiple: false,
        },
      ],
    }
  }

  eval(id: string, data: Data, params: Params, inputs: Inputs): Result {
    const one = inputs.get('one', data)
    const two = inputs.get('two', data)
    return new Result(one.value || two.value ? 1 : 0, [...one.metrics, ...two.metrics])
  }
}

export default Or
