import { Criteria, Data, JsonView, Result, Schema } from '../robot/criteria'
import { v4 } from 'uuid'
import None from './None'

class Price implements Criteria {
  private readonly id: string

  constructor(id: string = v4()) {
    this.id = id
  }

  eval(data: Data, result: Result): Result {
    return result.withValue(data.price).withMetric(this.id, 'Цена', data.price)
  }

  static getSchema(): Schema {
    return {
      type: 'price',
      name: 'Цена',
      multiple: false,
      params: [],
      input: [],
    }
  }

  static fromJSONParams() {
    return new Price()
  }

  static fromJSON(data: JsonView) {
    return new Price(data.id)
  }

  toJSON(): JsonView {
    return {
      id: this.id,
      type: 'price',
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

export default Price
