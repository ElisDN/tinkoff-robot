import { Client } from '../client'
import { PortfolioPosition } from '../contracts/operations'
import { AccountsAccount } from './accounts'

class PortfolioService {
  private readonly client: Client

  constructor(client: Client) {
    this.client = client
  }

  public async getPositions(account: AccountsAccount): Promise<PortfolioPosition[]> {
    let response
    if (account.real) {
      response = await this.client.operations.getPortfolio({ accountId: account.account.id })
    } else {
      response = await this.client.sandbox.getSandboxPortfolio({ accountId: account.account.id })
    }
    return response.positions
  }
}

export default PortfolioService
