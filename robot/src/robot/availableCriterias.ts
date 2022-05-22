import { Criteria, Schema } from './criteria'
import NotFound from '../criterias/NotFound'

export class AvailableCriterias {
  private readonly criterias: Criteria[]

  constructor(criterias: Criteria[]) {
    this.criterias = criterias
  }

  get(type: string): Criteria {
    const root = this.criterias.find((available) => available.getSchema().type === type)
    if (!root) {
      return new NotFound()
    }
    return root
  }

  getAllSchemas(): Schema[] {
    return this.criterias.map((available) => available.getSchema())
  }
}
