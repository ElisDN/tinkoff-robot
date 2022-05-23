import { Criteria, Schema } from '../robot/criteria'
import { Inputs, Params } from '../robot/node'
import { Data, Result } from '../robot/trading'

class Division implements Criteria {
  getSchema(): Schema {
    return {
      type: 'division',
      name: 'Деление',
      multiple: false,
      params: [],
      inputs: [
        {
          type: 'one',
          name: 'это',
          multiple: false,
        },
        {
          type: 'two',
          name: 'на',
          multiple: false,
        },
      ],
    }
  }

  eval(id: string, data: Data, params: Params, inputs: Inputs): Result {
    const one = inputs.get('one', data)
    const two = inputs.get('two', data)

    if (one.value === null || two.value === null) {
      return new Result(null, [...one.metrics, ...two.metrics])
    }

    if (Array.isArray(one.value) || Array.isArray(two.value)) {
      return new Result(null, [...one.metrics, ...two.metrics])
    }

    return new Result(one.value + two.value, [...one.metrics, ...two.metrics])
  }
}

export default Division
