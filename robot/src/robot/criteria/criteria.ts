export type CriteriaSchema = {
  type: string
  name: string
}

export interface Criteria {
  getSchema(): CriteriaSchema
  evaluate(): number | number[] | boolean
}
