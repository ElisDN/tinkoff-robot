import { OrderState } from '../sdk/contracts/orders'

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

  static blank(): Result {
    return new Result(0, [])
  }

  static of(value: number[] | number): Result {
    return new Result(value, [])
  }
}

export interface Criteria {
  without(id: string): Criteria
  with(id: string, criteria: Criteria): Criteria
  toJSON(): JsonView
  eval(data: Data): Result
}
