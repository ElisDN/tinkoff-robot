import { Client } from '../sdk/client'
import { Account } from './accounts'
import { moneyToFloat, quotationToFloat } from './convert'
import { PortfolioResponse } from '../sdk/contracts/operations'
import { InstrumentStatus } from '../sdk/contracts/instruments'

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

  getPositions(account: Account): Promise<Position[]> {
    let promise: Promise<PortfolioResponse> | null
    if (account.real) {
      promise = this.client.operations.getPortfolio({ accountId: account.id })
    } else {
      promise = this.client.sandbox.getSandboxPortfolio({ accountId: account.id })
    }

    return promise.then((response) => {
      return response.positions.map<Position>((position) => ({
        type: position.instrumentType,
        figi: position.figi,
        quantity: position.quantity ? quotationToFloat(position.quantity) : null,
        quantityLots: position.quantityLots ? quotationToFloat(position.quantityLots) : null,
        currentPrice: position.currentPrice ? moneyToFloat(position.currentPrice) : null,
        currentCost:
          position.currentPrice && position.quantity
            ? moneyToFloat(position.currentPrice) * quotationToFloat(position.quantity)
            : null,
      }))
    })
  }

  getAvailableMoney(account: Account, currency: string): Promise<number> {
    if (account.real) {
      return this.client.operations
        .getWithdrawLimits({ accountId: account.id })
        .then((response) => response.money)
        .then((money) => money.find((money) => money.currency === currency))
        .then((money) => (money ? moneyToFloat(money) : 0))
    }

    if (currency === 'rub') {
      return this.client.sandbox
        .getSandboxPortfolio({ accountId: account.id })
        .then((response) => response.positions)
        .then((positions) => positions.find((position) => position.figi === 'FG0000000000'))
        .then((position) => (position && position.quantity ? quotationToFloat(position.quantity) : 0))
    }

    return this.client.instruments
      .currencies({ instrumentStatus: InstrumentStatus.INSTRUMENT_STATUS_ALL })
      .then((response) => response.instruments)
      .then((instruments) => instruments.find((instrument) => instrument.currency === currency))
      .then((currency) => {
        if (!currency) {
          return 0
        }
        return this.client.sandbox
          .getSandboxPortfolio({ accountId: account.id })
          .then((response) => response.positions)
          .then((positions) => positions.find((position) => position.figi === currency.figi))
          .then((position) => (position && position.quantity ? quotationToFloat(position.quantity) : 0))
      })
  }

  async getAvailableLots(account: Account, figi: string) {
    return this.getPositions(account)
      .then((positions) => positions.find((position) => position.figi === figi))
      .then((position) => (position ? position.quantityLots || 0 : 0))
  }
}

export default PortfolioService
