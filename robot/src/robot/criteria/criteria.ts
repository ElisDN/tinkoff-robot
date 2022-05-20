export type Param = {
  type: string
  name: string
}

export type Input = {
  type: string
  name: string
  multiple: boolean
}

export type Schema = {
  type: string
  name: string
  multiple: boolean
  params: Param[]
  input: Input[]
}

export interface Criteria {
  getSchema(): Schema
  evaluate(): number | number[] | boolean
}
