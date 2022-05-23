import { Criteria, Schema } from '../robot/criteria'
import { Inputs, Params } from '../robot/node'
import { Data, Result } from '../robot/trading'

class Plus implements Criteria {
  getSchema(): Schema {
    return {
      type: 'plus',
      name: 'Плюс',
      multiple: false,
      params: [],
      inputs: [
        {
          type: 'one',
          name: 'чего',
          multiple: false,
        },
        {
          type: 'two',
          name: 'чего',
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

export default Plus
