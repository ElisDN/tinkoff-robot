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
  constructor(public readonly price: number) {}

  static blank(): Data {
    return new Data(0)
  }

  withPrice(price: number) {
    return new Data(price)
  }
}

type Metric = {
  type: string
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

  withMetric(metric: Metric): Result {
    return new Result(this.value, [...this.metrics, metric])
  }
}

export interface Criteria {
  without(id: string): Criteria
  with(id: string, criteria: Criteria): Criteria
  toJSON(): JsonView
  eval(data: Data, result: Result): Result
}
