import { Criteria, JsonView, Schema } from './criteria'
import NotFound from '../criterias/NotFound'
import None from '../criterias/None'

export type AvailableCriteria = {
  schema: Schema
  // eslint-disable-next-line @typescript-eslint/ban-types
  fromJSON: Function
  // eslint-disable-next-line @typescript-eslint/ban-types
  blank: Function
}

export class CriteriaCreator {
  private readonly available: AvailableCriteria[]

  constructor(available: AvailableCriteria[]) {
    this.available = available
  }

  createCriteria(type: string): Criteria {
    const root = this.available.find((available) => available.schema.type === type)
    if (!root) {
      return new NotFound()
    }
    return root.blank()
  }

  restoreCriteria(data: JsonView | null): Criteria {
    if (!data) {
      return new None()
    }
    const root = this.available.find((available) => available.schema.type === data.type)
    if (!root) {
      return new NotFound(data.id)
    }
    return root.fromJSON(data, this.restoreCriteria.bind(this))
  }

  getAvailableSchemas(): Schema[] {
    return this.available.map((available) => available.schema)
  }
}
