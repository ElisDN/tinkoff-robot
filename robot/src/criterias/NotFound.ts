import { Criteria, JsonView, Schema } from '../robot/criteria'
import { v4 } from 'uuid'
import None from './None'

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

  static blank() {
    return new NotFound()
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

  without(id: string): Criteria {
    if (this.id === id) {
      return new None()
    }
    return this
  }

  with(id: string, criteria: Criteria): Criteria {
    if (this.id === id) {
      return criteria
    }
    return this
  }
}

export default NotFound
