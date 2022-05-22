import { Criteria, Result, Schema } from '../robot/criteria'

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
