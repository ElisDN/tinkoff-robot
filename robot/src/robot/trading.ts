type Order = {
  id: string
  date: Date
  buy: boolean
  lots: number
  price: number
}

export class Data {
  public readonly date: Date
  public readonly price: number
  public readonly order: Order | null

  constructor(date: Date, price: number, order: Order | null) {
    this.date = date
    this.price = price
    this.order = order
  }

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
  public readonly id: string
  public readonly name: string
  public readonly value: number

  constructor(id: string, name: string, value: number) {
    this.id = id
    this.name = name
    this.value = value
  }
}

export class Result {
  public readonly value: number[] | number
  public readonly metrics: Metric[]

  constructor(value: number[] | number, metrics: Metric[]) {
    this.value = value
    this.metrics = metrics
  }
}
