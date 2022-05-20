import { Criteria, JsonView, Schema } from '../criteria'
import { v4 } from 'uuid'

class NotFound implements Criteria {
  private readonly id: string

  constructor(id: string = v4()) {
    this.id = id
  }

  static getSchema(): Schema {
    return {
      type: 'not-found',
      name: 'Не найдено',
      multiple: false,
      params: [],
      input: [],
    }
  }

  static fromJSON(data: JsonView) {
    return new NotFound(data.id)
  }

  toJSON(): JsonView {
    return {
      id: this.id,
      type: 'not-found',
      params: [],
      input: [],
    }
  }
}

export default NotFound
