import { Criteria, Data, JsonView, Result, Schema } from '../robot/criteria'
import { v4 } from 'uuid'
import None from './None'

class Or implements Criteria {
  private readonly id: string
  private readonly one: Criteria
  private readonly two: Criteria

  constructor(one: Criteria, two: Criteria, id: string = v4()) {
    this.id = id
    this.one = one
    this.two = two
  }

  eval(data: Data, result: Result): Result {
    const one = this.one.eval(data, result)
    const two = this.two.eval(data, result)
    return result
      .withValue(one.value || two.value ? 1 : 0)
      .withMetrics(one.metrics)
      .withMetrics(two.metrics)
  }

  static getSchema(): Schema {
    return {
      type: 'or',
      name: 'Или',
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
    return new Or(new None(), new None())
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  static fromJSON(data: JsonView, next: Function) {
    const one = data.input.find((input) => input.type === 'one')
    const two = data.input.find((input) => input.type === 'two')

    return new Or(next(one?.value || null), next(two?.value || null), data.id)
  }

  toJSON(): JsonView {
    return {
      id: this.id,
      type: 'or',
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
    return new Or(this.one.without(id), this.one.without(id))
  }

  with(id: string, criteria: Criteria): Criteria {
    if (this.id === id) {
      return criteria
    }
    return new Or(this.one.with(id, criteria), this.two.with(id, criteria))
  }
}

export default Or
