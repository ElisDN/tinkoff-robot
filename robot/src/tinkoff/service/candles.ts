import { Client } from '../client'
import { CandleInterval, HistoricCandle } from '../contracts/marketdata'

class CandlesService {
  private readonly client: Client

  constructor(client: Client) {
    this.client = client
  }

  public async getFrom(figi: string, from: Date): Promise<HistoricCandle[]> {
    const response = await this.client.marketData.getCandles({
      figi,
      from,
      to: new Date(),
      interval: CandleInterval.CANDLE_INTERVAL_1_MIN,
    })
    return response.candles
  }
}

export default CandlesService
