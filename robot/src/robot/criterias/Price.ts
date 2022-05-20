import { Criteria, JsonView, Schema } from '../criteria'
import { v4 } from 'uuid'

class Price implements Criteria {
  private readonly id: string

  constructor(id: string = v4()) {
    this.id = id
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

  toJSON(): JsonView {
    return {
      id: this.id,
      type: 'price',
      params: [],
      input: [],
    }
  }
}

export default Price
