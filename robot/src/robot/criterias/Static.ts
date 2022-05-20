import { Criteria, JsonView, Schema } from '../criteria'

class Static implements Criteria {
  private readonly value: number

  constructor(value: number) {
    this.value = value
  }

  static getSchema(): Schema {
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

  toJSON(): JsonView {
    return {
      type: 'static',
      params: [
        {
          type: 'value',
          value: this.value,
        },
      ],
      input: [],
    }
  }
}

export default Static
