import { createClientFactory } from 'nice-grpc'
import { UsersServiceDefinition } from './contracts/users'
import { StopOrdersServiceDefinition } from './contracts/stoporders'
import { InstrumentsServiceDefinition } from './contracts/instruments'
import { MarketDataServiceDefinition, MarketDataStreamServiceDefinition } from './contracts/marketdata'
import { OperationsServiceDefinition } from './contracts/operations'
import { OrdersServiceDefinition, OrdersStreamServiceDefinition } from './contracts/orders'
import { SandboxServiceDefinition } from './contracts/sandbox'
import { credentials, Metadata } from '@grpc/grpc-js'
import { createChannel } from 'nice-grpc'
import createLoggingMiddleware from './middleware/logging'
import { Logger } from 'winston'

const makeChannel = (token: string, appName: string, url: string) => {
  const metadata = new Metadata()
  metadata.add('Authorization', `Bearer ${token}`)
  metadata.add('x-app-name', appName)

  const metadataCreds = credentials.createFromMetadataGenerator(function (args, callback) {
    callback(null, metadata)
  })

  const sslCred = credentials.combineChannelCredentials(credentials.createSsl(), metadataCreds)

  return createChannel(url, sslCred)
}

const createSdk = (url: string, token: string, appName: string, logger: Logger) => {
  const channel = makeChannel(token, appName, url)

  const clientFactory = createClientFactory().use(createLoggingMiddleware(logger))

  return {
    instruments: clientFactory.create(InstrumentsServiceDefinition, channel),
    marketData: clientFactory.create(MarketDataServiceDefinition, channel),
    marketDataStream: clientFactory.create(MarketDataStreamServiceDefinition, channel),
    operations: clientFactory.create(OperationsServiceDefinition, channel),
    orders: clientFactory.create(OrdersServiceDefinition, channel),
    ordersStream: clientFactory.create(OrdersStreamServiceDefinition, channel),
    sandbox: clientFactory.create(SandboxServiceDefinition, channel),
    stopOrders: clientFactory.create(StopOrdersServiceDefinition, channel),
    users: clientFactory.create(UsersServiceDefinition, channel),
  }
}

export type Client = ReturnType<typeof createSdk>

export default createSdk
