import { Criteria, Data, JsonView, Result, Schema } from '../robot/criteria'
import { v4 } from 'uuid'

class None implements Criteria {
  private readonly id: string

  constructor(id: string = v4()) {
    this.id = id
  }

  eval(data: Data, result: Result): Result {
    return result.withValue(0)
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

  static fromJSONParams() {
    return new None()
  }

  static fromJSON(data: JsonView) {
    return new None(data.id)
  }

  toJSON(): JsonView {
    return {
      id: this.id,
      type: 'none',
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

export default None
