import { Client } from '../sdk/client'
import { Account } from './accounts'
import { moneyToFloat, quotationToFloat } from './convert'

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
    return response.positions.map<Position>((position) => ({
      figi: position.figi,
      quantity: position.quantity ? quotationToFloat(position.quantity) : null,
      quantityLots: position.quantityLots ? quotationToFloat(position.quantityLots) : null,
      currentPrice: position.averagePositionPrice ? moneyToFloat(position.averagePositionPrice) : null,
      currentCost:
        position.currentPrice && position.quantityLots
          ? moneyToFloat(position.currentPrice) * quotationToFloat(position.quantityLots)
          : null,
    }))
  }
}

export default PortfolioService
