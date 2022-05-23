import { Client } from '../sdk/client'
import { CandleInterval, HistoricCandle } from '../sdk/contracts/marketdata'
import { CacheContainer } from 'node-ts-cache'

class CandlesService {
  private readonly client: Client
  private readonly cache: CacheContainer

  constructor(client: Client, cache: CacheContainer) {
    this.client = client
    this.cache = cache
  }

  public async get(figi: string, from: Date, to: Date): Promise<HistoricCandle[]> {
    const cacheKey = 'candles-' + figi + '-' + from.toDateString() + '-' + to.toDateString()

    return this.cache
      .getItem<Promise<HistoricCandle[]>>(cacheKey)
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
              .then((response) => response.candles)
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
