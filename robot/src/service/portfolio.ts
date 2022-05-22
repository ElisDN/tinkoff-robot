import { Client } from '../sdk/client'
import { Account } from './accounts'
import { moneyToFloat, quotationToFloat } from './convert'
import InstrumentsService from './instruments'

type Position = {
  figi: string
  name: string
  ticker: string
  quantity: number | null
  quantityLots: number | null
  currentPrice: number | null
  currentCost: number | null
}

class PortfolioService {
  private readonly client: Client
  private readonly instruments: InstrumentsService

  constructor(client: Client, instruments: InstrumentsService) {
    this.client = client
    this.instruments = instruments
  }

  public async getPositions(account: Account): Promise<Position[]> {
    let response
    if (account.real) {
      response = await this.client.operations.getPortfolio({ accountId: account.id })
    } else {
      response = await this.client.sandbox.getSandboxPortfolio({ accountId: account.id })
    }
    return Promise.all(
      response.positions.map<Promise<Position>>(async (position) => {
        const instrument = await this.instruments.getByFigi(position.figi)

        return {
          figi: position.figi,
          name: instrument.name,
          ticker: instrument.ticker,
          quantity: position.quantity ? quotationToFloat(position.quantity) : null,
          quantityLots: position.quantityLots ? quotationToFloat(position.quantityLots) : null,
          currentPrice: position.averagePositionPrice ? moneyToFloat(position.averagePositionPrice) : null,
          currentCost:
            position.currentPrice && position.quantityLots
              ? moneyToFloat(position.currentPrice) * quotationToFloat(position.quantityLots)
              : null,
        }
      })
    )
  }
}

export default PortfolioService
