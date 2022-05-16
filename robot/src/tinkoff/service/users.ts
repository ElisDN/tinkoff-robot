import { Account } from '../contracts/users'
import { Client } from '../client'

interface Users {
  getAccounts(): Promise<Account[]>
}

class RealUsers implements Users {
  private readonly client: Client

  constructor(client: Client) {
    this.client = client
  }

  public async getAccounts(): Promise<Account[]> {
    const response = await this.client.users.getAccounts({})
    return response.accounts
  }
}

class SandboxUsers implements Users {
  private readonly client: Client

  constructor(client: Client) {
    this.client = client
  }

  public async getAccounts(): Promise<Account[]> {
    const response = await this.client.sandbox.getSandboxAccounts({})
    return response.accounts
  }
}

const createUsers = (client: Client, isSandbox: boolean) => {
  return isSandbox ? new SandboxUsers(client) : new RealUsers(client)
}

export default createUsers
