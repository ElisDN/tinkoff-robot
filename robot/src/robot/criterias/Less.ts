import { Criteria, Schema } from '../criteria'

class Less implements Criteria {
  getSchema(): Schema {
    return {
      type: 'less',
      name: 'Меньше',
      multiple: false,
      params: [],
      input: [
        {
          type: 'that',
          name: 'Что',
          multiple: false,
        },
        {
          type: 'than',
          name: 'Чего',
          multiple: false,
        },
      ],
    }
  }
}

export default Less
