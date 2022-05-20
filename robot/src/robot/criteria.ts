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

export type JsonView = {
  id: string
  type: string
  params: JsonParamView[]
  input: JsonInputView[]
}

export type JsonParamView = {
  type: string
  value: number | null
}

export type JsonInputView = {
  type: string
  value: JsonView | null
}

export interface Criteria {
  without(id: string): Criteria
  with(id: string, criteria: Criteria): Criteria
  toJSON(): JsonView
}
