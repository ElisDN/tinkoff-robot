import CandlesService, { Candle } from '../services/candles'
import { EvalResult } from './strategy'
import InstrumentsService from '../services/instruments'

export type Order = {
  id: string
  date: Date
  buy: boolean
  lots: number
  price: number
}

export class Data {
  public readonly date: Date
  public readonly candle: Candle | null
  public readonly candles: Record<string, Candle>
  public readonly order: Order | null

  constructor(date: Date, candle: Candle | null, candles: Record<string, Candle>, order: Order | null) {
    this.date = date
    this.candle = candle
    this.candles = candles
    this.order = order
  }

  static blank(date: Date = new Date()): Data {
    return new Data(date, null, {}, null)
  }

  withPrice(price: number) {
    const candle: Candle = {
      time: new Date(),
      open: price,
      high: price,
      low: price,
      close: price,
    }
    return new Data(this.date, candle, { [new Date().toUTCString()]: candle }, this.order)
  }

  withOrder(order: Order) {
    return new Data(this.date, this.candle, this.candles, order)
  }

  withCandle(candle: Candle) {
    return new Data(this.date, candle, { ...this.candles, [candle.time.toUTCString()]: candle }, this.order)
  }
}

export class Metric {
  public readonly id: string
  public readonly name: string
  public readonly value: number | null

  constructor(id: string, name: string, value: number | null) {
    this.id = id
    this.name = name
    this.value = value
  }
}

export class Result {
  public readonly value: number[] | number | null
  public readonly metrics: Metric[]

  constructor(value: number[] | number | null, metrics: Metric[]) {
    this.value = value
    this.metrics = metrics
  }
}

export type TickResult = {
  eval: EvalResult
  candle: Candle
}

export class Trader {
  constructor(public readonly candles: CandlesService, public readonly instruments: InstrumentsService) {}
}
