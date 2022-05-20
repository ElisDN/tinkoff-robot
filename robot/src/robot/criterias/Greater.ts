import {Criteria, JsonView, Schema} from '../criteria'

class Greater implements Criteria {
  private readonly that: Criteria
  private readonly than: Criteria

  constructor(that: Criteria, than: Criteria) {
    this.that = that
    this.than = than
  }

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

  toJSON(): JsonView {
    return {
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
