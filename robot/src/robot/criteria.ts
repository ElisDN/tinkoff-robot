import { Inputs, Params } from './node'
import { Data, Result } from './trading'

export type SchemaParam = {
  type: string
  name: string
}

export type SchemaInput = {
  type: string
  name: string
  multiple: boolean
}

export type Schema = {
  type: string
  name: string
  multiple: boolean
  params: SchemaParam[]
  inputs: SchemaInput[]
}

export interface Criteria {
  getSchema(): Schema
  eval(id: string, data: Data, params: Params, inputs: Inputs): Result
}
