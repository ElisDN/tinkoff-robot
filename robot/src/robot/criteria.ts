import { Inputs, Params } from './node'

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

type Order = {
  id: string
  date: Date
  buy: boolean
  lots: number
  price: number
}

export class Data {
  constructor(public readonly date: Date, public readonly price: number, public readonly order: Order | null) {}

  static blank(date: Date = new Date()): Data {
    return new Data(date, 0, null)
  }

  withPrice(price: number) {
    return new Data(this.date, price, this.order)
  }

  withOrder(order: Order) {
    return new Data(this.date, this.price, order)
  }
}

export class Metric {
  constructor(public readonly id: string, public readonly name: string, public readonly value: number) {}
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
