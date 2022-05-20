import { Criteria, JsonView, Schema } from '../criteria'

class None implements Criteria {
  static getSchema(): Schema {
    return {
      type: 'none',
      name: 'Нет',
      multiple: false,
      params: [],
      input: [],
    }
  }

  toJSON(): JsonView {
    return {
      type: 'none',
      params: [],
      input: [],
    }
  }
}

export default None
