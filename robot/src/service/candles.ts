import { Client } from '../sdk/client'
import { CandleInterval, HistoricCandle } from '../sdk/contracts/marketdata'

class CandlesService {
  private readonly client: Client

  constructor(client: Client) {
    this.client = client
  }

  public async get(figi: string, from: Date, to: Date): Promise<HistoricCandle[]> {
    let candles:HistoricCandle[] = []

    let fromDate = new Date(from)
    while (fromDate <= to) {
      const toDate = new Date(fromDate)
      toDate.setDate(fromDate.getDate() + 1)
      const response = await this.client.marketData.getCandles({
        figi,
        from: fromDate,
        to: toDate,
        interval: CandleInterval.CANDLE_INTERVAL_1_MIN,
      })
      candles.push(...response.candles)
      fromDate.setDate(fromDate.getDate() + 1)
    }

    return candles
  }
}

export default CandlesService
