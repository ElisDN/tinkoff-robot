import { Criteria, Schema } from '../robot/criteria'
import { Inputs, Params } from '../robot/node'
import { Data, Metric, Result } from '../robot/trading'

class Minus implements Criteria {
  getSchema(): Schema {
    return {
      type: 'minus',
      name: 'Минус',
      multiple: false,
      params: [],
      inputs: [
        {
          type: 'one',
          name: 'из',
          multiple: false,
        },
        {
          type: 'two',
          name: 'вычесть',
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

    const value = one.value - two.value

    return new Result(value, [...one.metrics, ...two.metrics, new Metric(id, 'Минус', value)])
  }
}

export default Minus
