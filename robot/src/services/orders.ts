import { Client } from '../sdk/client'
import { Account } from './accounts'
import { moneyToFloat } from './convert'
import {
  GetOrdersResponse,
  OrderDirection,
  OrderExecutionReportStatus,
  OrderType,
  PostOrderRequest,
  PostOrderResponse,
} from '../sdk/contracts/orders'
import { v4 } from 'uuid'

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
        .sort((a, b) => {
          if (!a.date || !b.date) {
            return 0
          }
          if (a.date.getTime() > b.date.getTime()) {
            return 1
          }
          if (a.date.getTime() < b.date.getTime()) {
            return -1
          }
          return 0
        })
    })
  }

  async postOrder(account: Account, figi: string, buy: boolean, lots: number): Promise<Order> {
    let promise: Promise<PostOrderResponse> | null
    const request: PostOrderRequest = PostOrderRequest.fromPartial({
      orderId: v4(),
      accountId: account.id,
      figi,
      orderType: OrderType.ORDER_TYPE_MARKET,
      direction: buy ? OrderDirection.ORDER_DIRECTION_BUY : OrderDirection.ORDER_DIRECTION_SELL,
      quantity: lots,
    })

    if (account.real) {
      promise = this.client.orders.postOrder(request)
    } else {
      promise = this.client.sandbox.postSandboxOrder(request)
    }

    return promise.then((response) => ({
      id: response.orderId,
      date: null,
      figi: response.figi,
      lots: response.lotsRequested,
      buy: response.direction === OrderDirection.ORDER_DIRECTION_BUY,
      price: response.initialOrderPrice ? moneyToFloat(response.initialOrderPrice) : null,
      comission: response.initialCommission ? moneyToFloat(response.initialCommission) : null,
    }))
  }
}

export default OrdersService
