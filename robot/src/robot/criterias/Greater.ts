import { Criteria, Schema } from '../criteria'

class Greater implements Criteria {
  getSchema(): Schema {
    return {
      type: 'greater',
      name: 'Больше',
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

export default Greater
