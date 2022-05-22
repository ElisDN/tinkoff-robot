import { Criteria, Data, Metric, Result, Schema } from '../robot/criteria'
import { Params } from '../robot/node'

class Static implements Criteria {
  getSchema(): Schema {
    return {
      type: 'static',
      name: 'Значение',
      multiple: false,
      params: [
        {
          type: 'value',
          name: 'Равно',
        },
      ],
      inputs: [],
    }
  }

  eval(id: string, data: Data, params: Params): Result {
    const value = params.get('value')
    return new Result(value, [new Metric(id, 'Значение', value)])
  }
}

export default Static
