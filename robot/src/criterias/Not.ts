import { Criteria, Schema } from '../robot/criteria'
import { Inputs, Params } from '../robot/node'
import { Data, Result } from '../robot/trading'

class Not implements Criteria {
  getSchema(): Schema {
    return {
      type: 'not',
      name: 'Не',
      multiple: false,
      params: [],
      inputs: [
        {
          type: 'one',
          name: 'что',
          multiple: false,
        },
      ],
    }
  }

  eval(id: string, data: Data, params: Params, inputs: Inputs): Result {
    const that = inputs.get('one', data)

    if (that.value === null) {
      return new Result(null, [...that.metrics, ...that.metrics])
    }

    return new Result(!that.value ? 1 : 0, that.metrics)
  }
}

export default Not
