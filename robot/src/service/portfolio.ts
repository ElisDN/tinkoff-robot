import { Client } from '../sdk/client'
import { PortfolioPosition } from '../sdk/contracts/operations'
import { Account } from './accounts'

class PortfolioService {
  private readonly client: Client

  constructor(client: Client) {
    this.client = client
  }

  public async getPositions(account: Account): Promise<PortfolioPosition[]> {
    let response
    if (account.real) {
      response = await this.client.operations.getPortfolio({ accountId: account.id })
    } else {
      response = await this.client.sandbox.getSandboxPortfolio({ accountId: account.id })
    }
    return response.positions
  }
}

export default PortfolioService
