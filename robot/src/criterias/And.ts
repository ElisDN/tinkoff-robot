import { Criteria, Data, JsonView, Result, Schema } from '../robot/criteria'
import { v4 } from 'uuid'
import None from './None'

class And implements Criteria {
  private readonly id: string
  private readonly one: Criteria
  private readonly two: Criteria

  constructor(one: Criteria, two: Criteria, id: string = v4()) {
    this.id = id
    this.one = one
    this.two = two
  }

  eval(data: Data, result: Result): Result {
    return result.withValue(this.one.eval(data, result).value && this.two.eval(data, result).value ? 1 : 0)
  }

  static getSchema(): Schema {
    return {
      type: 'and',
      name: 'И',
      multiple: false,
      params: [],
      input: [
        {
          type: 'one',
          name: 'что',
          multiple: false,
        },
        {
          type: 'two',
          name: 'что',
          multiple: false,
        },
      ],
    }
  }

  static fromJSONParams() {
    return new And(new None(), new None())
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  static fromJSON(data: JsonView, next: Function) {
    const one = data.input.find((input) => input.type === 'one')
    const two = data.input.find((input) => input.type === 'two')

    return new And(next(one?.value || null), next(two?.value || null), data.id)
  }

  toJSON(): JsonView {
    return {
      id: this.id,
      type: 'and',
      params: [],
      input: [
        {
          type: 'one',
          value: this.one.toJSON(),
        },
        {
          type: 'two',
          value: this.two.toJSON(),
        },
      ],
    }
  }

  without(id: string): Criteria {
    if (this.id === id) {
      return new None()
    }
    return new And(this.one.without(id), this.one.without(id))
  }

  with(id: string, criteria: Criteria): Criteria {
    if (this.id === id) {
      return criteria
    }
    return new And(this.one.with(id, criteria), this.two.with(id, criteria))
  }
}

export default And
