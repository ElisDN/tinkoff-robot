import { Client } from '../sdk/client'
import { Account } from './accounts'
import { moneyToFloat, quotationToFloat } from './convert'
import InstrumentsService from './instruments'

type Position = {
  figi: string
  quantity: number | null
  quantityLots: number | null
  currentPrice: number | null
  currentCost: number | null
}

class PortfolioService {
  private readonly client: Client

  constructor(client: Client) {
    this.client = client
  }

  public async getPositions(account: Account): Promise<Position[]> {
    let response
    if (account.real) {
      response = await this.client.operations.getPortfolio({ accountId: account.id })
    } else {
      response = await this.client.sandbox.getSandboxPortfolio({ accountId: account.id })
    }

    return response.positions.map<Position>((position) => {
      return {
        type: position.instrumentType,
        figi: position.figi,
        quantity: position.quantity ? quotationToFloat(position.quantity) : null,
        quantityLots: position.quantityLots ? quotationToFloat(position.quantityLots) : null,
        currentPrice: position.currentPrice ? moneyToFloat(position.currentPrice) : null,
        currentCost:
          position.currentPrice && position.quantity
            ? moneyToFloat(position.currentPrice) * quotationToFloat(position.quantity)
            : null,
      }
    })
  }
}

export default PortfolioService
