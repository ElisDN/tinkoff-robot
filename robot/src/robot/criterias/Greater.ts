import { Criteria, JsonView, Schema} from '../criteria'
import { v4 } from 'uuid'

class Greater implements Criteria {
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
      type: 'greater',
      name: 'Больше',
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

  // eslint-disable-next-line @typescript-eslint/ban-types
  static fromJSON(data: JsonView, next: Function) {
    const that = data.input.find((input) => input.type === 'that')
    const than = data.input.find((input) => input.type === 'than')

    return new Greater(next(that?.value || null), next(than?.value || null), data.id)
  }

  toJSON(): JsonView {
    return {
      id: this.id,
      type: 'greater',
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

export default Greater
