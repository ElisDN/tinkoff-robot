import { Criteria, JsonView, Schema } from '../criteria'
import { v4 } from 'uuid'

class Less implements Criteria {
  private readonly id: string
  private readonly that: Criteria
  private readonly than: Criteria

  constructor(that: Criteria, than: Criteria, id: string = v4()) {
    this.id = id
    this.that = that
    this.than = than
  }

  static getSchema(): Schema {
    return {
      type: 'less',
      name: 'Меньше',
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

  toJSON(): JsonView {
    return {
      id: this.id,
      type: 'less',
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
}

export default Less
