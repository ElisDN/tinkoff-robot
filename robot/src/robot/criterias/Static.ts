import { Criteria, JsonView, Schema } from '../criteria'
import { v4 } from 'uuid'

class Static implements Criteria {
  private readonly id: string
  private readonly value: number

  constructor(value: number, id: string = v4()) {
    this.id = id
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
      id: this.id,
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
