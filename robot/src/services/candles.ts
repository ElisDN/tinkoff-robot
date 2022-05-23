import { Client } from '../sdk/client'
import { CandleInterval } from '../sdk/contracts/marketdata'
import { CacheContainer } from 'node-ts-cache'
import { quotationToFloat } from './convert'

export type Candle = {
  time: Date
  open: number
  high: number
  low: number
  close: number
  isComplete: boolean
}

class CandlesService {
  private readonly client: Client
  private readonly cache: CacheContainer

  constructor(client: Client, cache: CacheContainer) {
    this.client = client
    this.cache = cache
  }

  public async getHistory(figi: string, from: Date, to: Date): Promise<Candle[]> {
    const cacheKey = 'candles-' + figi + '-' + from.toDateString() + '-' + to.toDateString()

    return this.cache
      .getItem<Promise<Candle[]>>(cacheKey)
      .then((cached) => {
        if (cached) {
          return cached
        }

        const searches = []
        const fromDate = new Date(from)
        while (fromDate <= to) {
          const toDate = new Date(fromDate)
          toDate.setDate(fromDate.getDate() + 1)
          searches.push({ fromDate: new Date(fromDate), toDate: new Date(toDate) })
          fromDate.setDate(fromDate.getDate() + 1)
        }

        return Promise.all(
          searches.map((search) => {
            return this.client.marketData
              .getCandles({
                figi,
                from: search.fromDate,
                to: search.toDate,
                interval: CandleInterval.CANDLE_INTERVAL_1_MIN,
              })
              .then((response) =>
                response.candles
                  .filter((candle) => candle.isComplete)
                  .map<Candle>((candle) => ({
                    time: candle.time || new Date(),
                    open: candle.open ? quotationToFloat(candle.open) : -1,
                    high: candle.high ? quotationToFloat(candle.high) : -1,
                    low: candle.low ? quotationToFloat(candle.low) : -1,
                    close: candle.close ? quotationToFloat(candle.close) : -1,
                    isComplete: candle.isComplete,
                  }))
              )
          })
        ).then((batches) => {
          return batches.flatMap((batch) => batch)
        })
      })
      .then((candles) => {
        return this.cache.setItem(cacheKey, candles, { ttl: 10 }).then(() => candles)
      })
  }
}

export default CandlesService
