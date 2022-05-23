import { Client } from '../sdk/client'
import { Account } from './accounts'
import { OperationsResponse, OperationState, OperationType } from '../sdk/contracts/operations'
import { moneyToFloat } from './convert'

type Operation = {
  id: string
  date: Date
  figi: string
  buy: boolean
  lots: number
  price: number
}

class OperationsService {
  private readonly client: Client

  constructor(client: Client) {
    this.client = client
  }

  public getAllExecuted(account: Account, figi: string, from: Date, to: Date): Promise<Operation[]> {
    let promise: Promise<OperationsResponse> | null
    if (account.real) {
      promise = this.client.operations.getOperations({
        accountId: account.id,
        figi,
        from,
        to,
        state: OperationState.OPERATION_STATE_EXECUTED,
      })
    } else {
      promise = this.client.sandbox.getSandboxOperations({
        accountId: account.id,
        figi,
        from,
        to,
        state: OperationState.OPERATION_STATE_EXECUTED,
      })
    }

    return promise.then((response) => {
      return response.operations
        .filter((operation) => {
          return (
            operation.operationType === OperationType.OPERATION_TYPE_BUY ||
            operation.operationType === OperationType.OPERATION_TYPE_SELL
          )
        })
        .map<Operation>((operation) => ({
          id: operation.id,
          date: operation.date || new Date(0),
          figi: operation.figi,
          buy: operation.operationType === OperationType.OPERATION_TYPE_BUY,
          lots: operation.quantity,
          price: operation.price ? moneyToFloat(operation.price) : 0,
        }))
    })
  }
}

export default OperationsService
