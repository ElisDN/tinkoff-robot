import { Criteria, Schema } from '../criteria'

class Static implements Criteria {
  getSchema(): Schema {
    return {
      type: 'static',
      name: 'Значение',
      multiple: false,
      params: [
        {
          type: 'value',
          name: 'Равно',
        },
      ],
      input: [],
    }
  }
}

export default Static
