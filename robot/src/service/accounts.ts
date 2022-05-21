import { Account as ClientAccount, AccountStatus } from '../sdk/contracts/users'
import { Client } from '../sdk/client'

export type Account = {
  real: boolean
  account: ClientAccount
}

class AccountsService {
  private readonly client: Client
  private real: Account[] | null = null
  private sandbox: Account[] | null = null

  constructor(client: Client) {
    this.client = client
  }

  public async getAll(): Promise<Account[]> {
    const real = await this.getAllReal()
    const sandbox = await this.getAllSandbox()
    return [...real, ...sandbox]
  }

  public async get(id: string): Promise<Account> {
    const accounts = await this.getAll()
    const account = accounts.find((account) => account.account.id === id)
    if (account) {
      return account
    }
    throw new Error('Счёт не найден')
  }

  public async openSandboxAccount() {
    await this.client.sandbox.openSandboxAccount({})
    this.sandbox = null
  }

  public async closeSandboxAccount(accountId: string) {
    await this.client.sandbox.closeSandboxAccount({ accountId })
    this.sandbox = null
  }

  private async getAllReal(): Promise<Account[]> {
    if (this.real === null) {
      const real = await this.client.users.getAccounts({})
      this.real = real.accounts
        .filter((account) => account.status === AccountStatus.ACCOUNT_STATUS_OPEN)
        .map<Account>((account) => ({ real: true, account }))
    }
    return this.real || []
  }

  private async getAllSandbox(): Promise<Account[]> {
    if (this.sandbox === null) {
      const sandbox = await this.client.sandbox.getSandboxAccounts({})
      this.sandbox = sandbox.accounts
        .filter((account) => account.status === AccountStatus.ACCOUNT_STATUS_OPEN)
        .map<Account>((account) => ({ real: false, account }))
    }
    return this.sandbox || []
  }
}

export default AccountsService
