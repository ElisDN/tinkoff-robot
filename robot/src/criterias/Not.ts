import { Criteria, Data, JsonView, Result, Schema } from '../robot/criteria'
import { v4 } from 'uuid'
import None from './None'

class Not implements Criteria {
  private readonly id: string
  private readonly that: Criteria

  constructor(that: Criteria, id: string = v4()) {
    this.id = id
    this.that = that
  }

  eval(data: Data, result: Result): Result {
    return result.withValue(!this.that.eval(data, result).value ? 1 : 0)
  }

  static getSchema(): Schema {
    return {
      type: 'not',
      name: 'Не',
      multiple: false,
      params: [],
      input: [
        {
          type: 'that',
          name: 'что',
          multiple: false,
        },
      ],
    }
  }

  static fromJSONParams() {
    return new Not(new None())
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  static fromJSON(data: JsonView, next: Function) {
    const that = data.input.find((input) => input.type === 'that')

    return new Not(next(that?.value || null), data.id)
  }

  toJSON(): JsonView {
    return {
      id: this.id,
      type: 'not',
      params: [],
      input: [
        {
          type: 'that',
          value: this.that.toJSON(),
        },
      ],
    }
  }

  without(id: string): Criteria {
    if (this.id === id) {
      return new None()
    }
    return new Not(this.that.without(id))
  }

  with(id: string, criteria: Criteria): Criteria {
    if (this.id === id) {
      return criteria
    }
    return new Not(this.that.with(id, criteria))
  }
}

export default Not
