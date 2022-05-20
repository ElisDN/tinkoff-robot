import { Criteria, JsonView, Schema } from './criteria'
import None from './criterias/None'
import NotFound from './criterias/NotFound'

export type AvailableCriteria = {
  schema: Schema
  // eslint-disable-next-line @typescript-eslint/ban-types
  fromJSON: Function
  blank: Function
}

export class CriteriasService {
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
