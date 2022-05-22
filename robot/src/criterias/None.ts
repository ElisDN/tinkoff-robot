import { Criteria, Schema } from '../robot/criteria'
import { Result } from '../robot/trading'

class None implements Criteria {
  getSchema(): Schema {
    return {
      type: 'none',
      name: 'Нет',
      multiple: false,
      params: [],
      inputs: [],
    }
  }

  eval(): Result {
    return new Result(0, [])
  }
}

export default None
