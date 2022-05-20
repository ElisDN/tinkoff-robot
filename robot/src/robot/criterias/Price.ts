import { Criteria, Schema } from '../criteria'

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
}

export default Price
