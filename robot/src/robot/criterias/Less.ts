import {Criteria, JsonView, Schema} from '../criteria'

class Less implements Criteria {
  private readonly that: Criteria
  private readonly than: Criteria

  constructor(that: Criteria, than: Criteria) {
    this.that = that
    this.than = than
  }

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

  toJSON(): JsonView {
    return {
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
