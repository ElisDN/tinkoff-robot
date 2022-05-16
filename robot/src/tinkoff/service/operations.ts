import { Client } from '../client'
import { PortfolioPosition } from '../contracts/operations'

interface Operations {
  getPortfolio(accountId: string): Promise<PortfolioPosition[]>
}

class RealOperations implements Operations {
  private readonly client: Client

  constructor(client: Client) {
    this.client = client
  }

  public async getPortfolio(accountId: string): Promise<PortfolioPosition[]> {
    const response = await this.client.operations.getPortfolio({ accountId })
    return response.positions
  }
}

class SandboxOperations implements Operations {
  private readonly client: Client

  constructor(client: Client) {
    this.client = client
  }

  public async getPortfolio(accountId: string): Promise<PortfolioPosition[]> {
    const response = await this.client.sandbox.getSandboxPortfolio({ accountId })
    return response.positions
  }
}

const createOperations = (client: Client, isSandbox: boolean) => {
  return isSandbox ? new SandboxOperations(client) : new RealOperations(client)
}

export default createOperations
