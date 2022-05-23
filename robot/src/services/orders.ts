import { Client } from '../sdk/client'
import { Account } from './accounts'
import { moneyToFloat } from './convert'
import { GetOrdersResponse, OrderDirection, OrderExecutionReportStatus } from '../sdk/contracts/orders'

export type Order = {
  id: string
  date: Date | null
  figi: string
  buy: boolean
  lots: number
  price: number | null
  comission: number | null
}

class OrdersService {
  private readonly client: Client

  constructor(client: Client) {
    this.client = client
  }

  public getAllNew(account: Account, figi: string): Promise<Order[]> {
    let promise: Promise<GetOrdersResponse> | null
    if (account.real) {
      promise = this.client.orders.getOrders({ accountId: account.id })
    } else {
      promise = this.client.sandbox.getSandboxOrders({ accountId: account.id })
    }

    return promise.then((response) => {
      return response.orders
        .filter(
          (order) =>
            order.figi === figi &&
            order.executionReportStatus === OrderExecutionReportStatus.EXECUTION_REPORT_STATUS_NEW
        )
        .map<Order>((order) => ({
          id: order.orderId,
          date: order.orderDate || null,
          figi: order.figi,
          lots: order.lotsRequested,
          buy: order.direction === OrderDirection.ORDER_DIRECTION_BUY,
          price: order.executedOrderPrice ? moneyToFloat(order.executedOrderPrice) : null,
          comission: order.serviceCommission ? moneyToFloat(order.serviceCommission) : null,
        }))
    })
  }
}

export default OrdersService
