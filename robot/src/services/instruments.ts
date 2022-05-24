import { Client } from '../sdk/client'
import { InstrumentIdType } from '../sdk/contracts/instruments'
import { CacheContainer } from 'node-ts-cache'

export type Instrument = {
  figi: string
  ticker: string
  name: string
  lot: number
  available: boolean
  currency: string
}

class InstrumentsService {
  private readonly client: Client
  private readonly cache: CacheContainer

  constructor(client: Client, cache: CacheContainer) {
    this.client = client
    this.cache = cache
  }

  public getByFigi(figi: string): Promise<Instrument> {
    if (figi === 'FG0000000000') {
      return Promise.resolve<Instrument>({
        figi: figi,
        ticker: '',
        name: '',
        lot: 1,
        available: true,
        currency: 'rub',
      })
    }

    const cacheKey = 'instrument-' + figi

    return this.cache.getItem<Promise<Instrument>>(cacheKey).then((cached) => {
      if (cached) {
        return cached
      }
      return this.client.instruments
        .getInstrumentBy({ idType: InstrumentIdType.INSTRUMENT_ID_TYPE_FIGI, id: figi })
        .then<Instrument>((response) => {
          if (!response.instrument) {
            throw new Error('Инструмент ' + figi + ' не найден')
          }
          return {
            figi: response.instrument.figi,
            ticker: response.instrument.ticker,
            name: response.instrument.name,
            lot: response.instrument.lot,
            currency: response.instrument.currency,
            available: response.instrument.buyAvailableFlag && response.instrument.buyAvailableFlag,
          }
        })
        .then((instrument) => {
          return this.cache.setItem(cacheKey, instrument, { ttl: 60 }).then(() => instrument)
        })
    })
  }
}

export default InstrumentsService
