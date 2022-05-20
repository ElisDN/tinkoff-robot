import { Criteria, Schema } from '../criteria'

class None implements Criteria {
  getSchema(): Schema {
    return {
      type: 'none',
      name: 'Нет',
      multiple: false,
      params: [],
      input: [],
    }
  }
}

export default None
