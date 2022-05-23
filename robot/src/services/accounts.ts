import { AccessLevel, AccountStatus } from '../sdk/contracts/users'
import { Client } from '../sdk/client'
import { floatToMoney } from './convert'

export type Account = {
  id: string
  name: string
  real: boolean
}

class AccountsService {
  private readonly client: Client
  private real: Promise<Account[]> | null = null
  private sandbox: Promise<Account[]> | null = null

  constructor(client: Client) {
    this.client = client
  }

  public async getAll(): Promise<Account[]> {
    return Promise.all([this.getAllReal(), this.getAllSandbox()]).then(([real, sandbox]) => [...real, ...sandbox])
  }

  public get(id: string): Promise<Account> {
    return this.getAll().then((accounts) => {
      const account = accounts.find((account) => account.id === id)
      if (!account) {
        throw new Error('Счёт не найден')
      }
      return account
    })
  }

  public openSandboxAccount() {
    return this.client.sandbox.openSandboxAccount({}).then(() => {
      this.sandbox = null
    })
  }

  paySandboxAccount(accountId: string, amount: number, currency: string) {
    return this.client.sandbox.sandboxPayIn({ accountId, amount: floatToMoney(amount, currency) }).then(() => {
      this.sandbox = null
    })
  }

  public closeSandboxAccount(accountId: string) {
    return this.client.sandbox.closeSandboxAccount({ accountId }).then(() => {
      this.sandbox = null
    })
  }

  private getAllReal(): Promise<Account[]> {
    if (this.real === null) {
      this.real = this.client.users.getAccounts({}).then((response) => {
        return response.accounts
          .filter(
            (account) =>
              account.status === AccountStatus.ACCOUNT_STATUS_OPEN &&
              account.accessLevel === AccessLevel.ACCOUNT_ACCESS_LEVEL_FULL_ACCESS
          )
          .map<Account>((account) => ({ real: true, id: account.id, name: account.name || account.id }))
      })
    }
    return this.real
  }

  private getAllSandbox(): Promise<Account[]> {
    if (this.sandbox === null) {
      this.sandbox = this.client.sandbox.getSandboxAccounts({}).then((response) => {
        return response.accounts
          .filter((account) => account.status === AccountStatus.ACCOUNT_STATUS_OPEN)
          .map<Account>((account) => ({
            real: false,
            id: account.id,
            name: 'Песочница ' + account.id.slice(0, 4).toUpperCase(),
          }))
      })
    }
    return this.sandbox
  }
}

export default AccountsService
