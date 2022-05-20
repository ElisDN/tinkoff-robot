import { Criteria, JsonView, Schema } from '../criteria'
import { v4 } from 'uuid'

class None implements Criteria {
  private readonly id: string

  constructor(id: string = v4()) {
    this.id = id
  }

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
      id: this.id,
      type: 'none',
      params: [],
      input: [],
    }
  }
}

export default None
