import { Criteria, Schema } from '../robot/criteria'
import { Result } from '../robot/trading'

class NotFound implements Criteria {
  getSchema(): Schema {
    return {
      type: 'not-found',
      name: 'Не найдено',
      multiple: false,
      params: [],
      inputs: [],
    }
  }

  eval(): Result {
    return new Result(null, [])
  }
}

export default NotFound
