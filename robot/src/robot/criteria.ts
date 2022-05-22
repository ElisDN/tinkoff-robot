import { Inputs, Params } from './node'
import { Data, Metric } from './trading'

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

export class Result {
  public readonly value: number[] | number
  public readonly metrics: Metric[]

  constructor(value: number[] | number, metrics: Metric[]) {
    this.value = value
    this.metrics = metrics
  }
}

export interface Criteria {
  getSchema(): Schema
  eval(id: string, data: Data, params: Params, inputs: Inputs): Result
}
