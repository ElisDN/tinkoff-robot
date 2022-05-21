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

    const cached = await this.cache.getItem<HistoricCandle[]>(cacheKey)
    if (cached) {
      return cached
    }

    const candles: HistoricCandle[] = []

    const fromDate = new Date(from)
    fromDate.setDate(fromDate.getDate() - 1)

    while (fromDate <= to) {
      fromDate.setHours(23, 59, 59, 999)
      const toDate = new Date(fromDate)
      toDate.setDate(fromDate.getDate() + 1)
      toDate.setHours(23, 59, 59, 999)
      const response = await this.client.marketData.getCandles({
        figi,
        from: fromDate,
        to: toDate,
        interval: CandleInterval.CANDLE_INTERVAL_1_MIN,
      })
      candles.push(...response.candles)
      fromDate.setDate(fromDate.getDate() + 1)
    }

    await this.cache.setItem(cacheKey, candles, {
      ttl: 10,
    })

    return candles
  }
}

export default CandlesService
