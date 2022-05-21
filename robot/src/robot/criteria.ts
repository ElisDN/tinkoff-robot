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

export class Data {
  constructor(public readonly date: Date, public readonly price: number) {}

  static blank(date: Date = new Date()): Data {
    return new Data(date, 0)
  }

  withPrice(price: number) {
    return new Data(this.date, price)
  }
}

export type Metric = {
  id: string
  name: string
  value: number
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

  withValue(value: number[] | number): Result {
    return new Result(value, this.metrics)
  }

  withMetric(id: string, name: string, value: number): Result {
    return new Result(this.value, [...this.metrics, { id, name, value }])
  }
}

export interface Criteria {
  without(id: string): Criteria
  with(id: string, criteria: Criteria): Criteria
  toJSON(): JsonView
  eval(data: Data, result: Result): Result
}
