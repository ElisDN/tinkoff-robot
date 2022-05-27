import CandlesService, { Candle } from '../services/candles'
import InstrumentsService from '../services/instruments'
import OrdersService from '../services/orders'
import AccountsService from '../services/accounts'
import { Order } from '../services/orders'
import { CacheContainer } from 'node-ts-cache'
import { Logger } from 'winston'
import MarketService from '../services/market'
import PortfolioService from '../services/portfolio'
import OperationsService from '../services/operations'

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
      isComplete: true,
    }
    return new Data(this.date, candle, { [new Date().toUTCString()]: candle }, this.order)
  }

  withOrder(order: Order) {
    return new Data(this.date, this.candle, this.candles, order)
  }

  withCandle(candle: Candle) {
    const candles = Object.fromEntries(Object.entries(this.candles).slice(-1440))

    return new Data(this.date, candle, { ...candles, [candle.time.toUTCString()]: candle }, this.order)
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

export class Services {
  constructor(
    public readonly accounts: AccountsService,
    public readonly candles: CandlesService,
    public readonly instruments: InstrumentsService,
    public readonly orders: OrdersService,
    public readonly operations: OperationsService,
    public readonly portfolio: PortfolioService,
    public readonly market: MarketService,
    public readonly cache: CacheContainer,
    public readonly logger: Logger
  ) {}
}
