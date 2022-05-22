import { Criteria, Data, JsonView, Result, Schema } from '../robot/criteria'
import { v4 } from 'uuid'
import None from './None'

class Greater implements Criteria {
  private readonly id: string
  private readonly that: Criteria
  private readonly than: Criteria

  constructor(that: Criteria, than: Criteria, id: string = v4()) {
    this.id = id
    this.that = that
    this.than = than
  }

  eval(data: Data): Result {
    const that = this.that.eval(data)
    const than = this.than.eval(data)
    return new Result(that.value > than.value ? 1 : 0, [...that.metrics, ...than.metrics])
  }

  static getSchema(): Schema {
    return {
      type: 'greater',
      name: 'Больше',
      multiple: false,
      params: [],
      input: [
        {
          type: 'that',
          name: 'что',
          multiple: false,
        },
        {
          type: 'than',
          name: 'чего',
          multiple: false,
        },
      ],
    }
  }

  static fromJSONParams() {
    return new Greater(new None(), new None())
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  static fromJSON(data: JsonView, next: Function) {
    const that = data.input.find((input) => input.type === 'that')
    const than = data.input.find((input) => input.type === 'than')

    return new Greater(next(that?.value || null), next(than?.value || null), data.id)
  }

  toJSON(): JsonView {
    return {
      id: this.id,
      type: 'greater',
      params: [],
      input: [
        {
          type: 'that',
          value: this.that.toJSON(),
        },
        {
          type: 'than',
          value: this.than.toJSON(),
        },
      ],
    }
  }

  without(id: string): Criteria {
    if (this.id === id) {
      return new None()
    }
    return new Greater(this.that.without(id), this.than.without(id))
  }

  with(id: string, criteria: Criteria): Criteria {
    if (this.id === id) {
      return criteria
    }
    return new Greater(this.that.with(id, criteria), this.than.with(id, criteria))
  }
}

export default Greater
