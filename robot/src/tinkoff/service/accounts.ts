import { Account, AccountStatus } from '../contracts/users'
import { Client } from '../client'

export type AccountsAccount = {
  real: boolean
  account: Account
}

class AccountsService {
  private readonly client: Client
  private real: AccountsAccount[] | null = null
  private sandbox: AccountsAccount[] | null = null

  constructor(client: Client) {
    this.client = client
  }

  public async getAll(): Promise<AccountsAccount[]> {
    const real = await this.getAllReal()
    const sandbox = await this.getAllSandbox()
    return [...real, ...sandbox]
  }

  public async get(id: string): Promise<AccountsAccount> {
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

  private async getAllReal(): Promise<AccountsAccount[]> {
    if (this.real === null) {
      const real = await this.client.users.getAccounts({})
      this.real = real.accounts
        .filter((account) => account.status === AccountStatus.ACCOUNT_STATUS_OPEN)
        .map<AccountsAccount>((account) => ({ real: true, account }))
    }
    return this.real || []
  }

  private async getAllSandbox(): Promise<AccountsAccount[]> {
    if (this.sandbox === null) {
      const sandbox = await this.client.sandbox.getSandboxAccounts({})
      this.sandbox = sandbox.accounts
        .filter((account) => account.status === AccountStatus.ACCOUNT_STATUS_OPEN)
        .map<AccountsAccount>((account) => ({ real: false, account }))
    }
    return this.sandbox || []
  }
}

export default AccountsService
