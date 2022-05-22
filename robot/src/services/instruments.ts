import { Client } from '../sdk/client'
import { InstrumentIdType } from '../sdk/contracts/instruments'
import { CacheContainer } from 'node-ts-cache'

type Instrument = {
  figi: string
  ticker: string
  name: string
  lot: number
}

class InstrumentsService {
  private readonly client: Client
  private readonly cache: CacheContainer

  constructor(client: Client, cache: CacheContainer) {
    this.client = client
    this.cache = cache
  }

  public async getByFigi(figi: string): Promise<Instrument> {
    const cacheKey = 'instrument-' + figi

    const cached = await this.cache.getItem<Instrument>(cacheKey)
    if (cached) {
      return cached
    }

    const response = await this.client.instruments.getInstrumentBy({
      idType: InstrumentIdType.INSTRUMENT_ID_TYPE_FIGI,
      id: figi,
    })

    if (!response.instrument) {
      throw new Error('Инструмент ' + figi + ' не найден')
    }

    const instrument = {
      figi: response.instrument.figi,
      ticker: response.instrument.ticker,
      name: response.instrument.name,
      lot: response.instrument.lot,
    }

    await this.cache.setItem(cacheKey, instrument, {
      ttl: 60,
    })

    return instrument
  }
}

export default InstrumentsService
