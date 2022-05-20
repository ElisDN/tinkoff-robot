import { Criteria, JsonView, Schema } from './criteria'
import None from './criterias/None'
import NotFound from "./criterias/NotFound";

export type AvailableCriteria = {
  schema: Schema
  // eslint-disable-next-line @typescript-eslint/ban-types
  factory: Function
}

export class CriteriasService {
  private readonly available: AvailableCriteria[]

  constructor(available: AvailableCriteria[]) {
    this.available = available
  }

  restoreCriteria(data: JsonView | null): Criteria {
    if (!data) {
      return new None()
    }
    const root = this.available.find((available) => available.schema.type === data.type)
    if (!root) {
      return new NotFound(data.id)
    }
    return root.factory(data, this.restoreCriteria.bind(this))
  }

  getAvailableSchemas(): Schema[] {
    return this.available.map((available) => available.schema)
  }
}
