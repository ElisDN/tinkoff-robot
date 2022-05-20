import { Criteria, JsonView, Schema } from '../criteria'

class Price implements Criteria {
  getSchema(): Schema {
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
      type: 'price',
      params: [],
      input: [],
    }
  }
}

export default Price
