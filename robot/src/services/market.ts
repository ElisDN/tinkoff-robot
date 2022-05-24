import { Client } from '../sdk/client'
import { MarketDataRequest, SubscriptionAction, SubscriptionInterval } from '../sdk/contracts/marketdata'
import { quotationToFloat } from './convert'
import { Candle } from './candles'

class MarketService {
  private readonly client: Client
  private readonly killSwitch: AbortController

  constructor(client: Client, killSwitch: AbortController) {
    this.client = client
    this.killSwitch = killSwitch
  }

  async *subscribeToCandles(figi: string) {
    const killSwitch = this.killSwitch
    async function* getSubscribeCandlesRequest() {
      while (!killSwitch.signal.aborted) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        yield MarketDataRequest.fromPartial({
          subscribeCandlesRequest: {
            subscriptionAction: SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE,
            instruments: [
              {
                figi: figi,
                interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
              },
            ],
          },
        })
      }
    }
    const stream = this.client.marketDataStream.marketDataStream(getSubscribeCandlesRequest())
    for await (const message of stream) {
      if (message.candle) {
        const candle: Candle = {
          time: message.candle.time || new Date(0),
          open: message.candle.open ? quotationToFloat(message.candle.open) : 0,
          high: message.candle.high ? quotationToFloat(message.candle.high) : 0,
          low: message.candle.low ? quotationToFloat(message.candle.low) : 0,
          close: message.candle.close ? quotationToFloat(message.candle.close) : 0,
          isComplete: true,
        }
        yield candle
      }
    }
  }

  async unsubscribeFromCandles(figi: string) {
    async function* getUnSubscribeCandlesRequest() {
      yield MarketDataRequest.fromPartial({
        subscribeCandlesRequest: {
          subscriptionAction: SubscriptionAction.SUBSCRIPTION_ACTION_UNSUBSCRIBE,
          instruments: [
            {
              figi: figi,
              interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
            },
          ],
        },
      })
    }
    return this.client.marketDataStream.marketDataStream(getUnSubscribeCandlesRequest())
  }
}

export default MarketService
