import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import createSdk from './sdk/client'
import AccountsService from './services/accounts'
import PortfolioService from './services/portfolio'
import RobotsPool from './robot/robotsPool'
import { v4 as uuid } from 'uuid'
import { FileRobotsStorage } from './robot/robotsStorage'
import * as path from 'path'
import CandlesService from './services/candles'
import createLogger from './logger'
import { createAuthAction, createAuthMiddleware } from './auth'
import Greater from './criterias/Greater'
import None from './criterias/None'
import Static from './criterias/Static'
import PriceClose from './criterias/PriceClose'
import Less from './criterias/Less'
import { AvailableCriterias } from './robot/availableCriterias'
import { Strategy } from './robot/strategy'
import And from './criterias/And'
import Or from './criterias/Or'
import Not from './criterias/Not'
import { CacheContainer } from 'node-ts-cache'
import { MemoryStorage } from 'node-ts-cache-storage-memory'
import { Params } from './robot/node'
import InstrumentsService from './services/instruments'
import { Services } from './robot/trading'
import PricesHigh from './criterias/PricesHigh'
import PricesLow from './criterias/PricesLow'
import PricesClose from './criterias/PricesClose'
import SMA from './criterias/SMA'
import Plus from './criterias/Plus'
import Minus from './criterias/Minus'
import Multiplication from './criterias/Multiplication'
import Division from './criterias/Division'
import OrdersService from './services/orders'
import OperationsService from './services/operations'
import LastBuyPrice from './criterias/LastBuyPrice'
import LastSellPrice from './criterias/LastSellPrice'
import MarketService from './services/market'

// Configuration

dotenv.config()

const authSecret = process.env.AUTH_SECRET
if (!authSecret) {
  console.error('Укажите любой AUTH_SECRET')
  process.exit(1)
}

const authTimeout = 3600 * 4
const authPassword = process.env.AUTH_PASSWORD
if (!authPassword) {
  console.error('Установите пароль AUTH_PASSWORD')
  process.exit(1)
}

const tinkoffHost = 'invest-public-api.tinkoff.ru:443'
const tinkoffApp = 'ElisDN'
const tinkoffToken = process.env.TINKOFF_TOKEN
if (!tinkoffToken) {
  console.error('Укажите TINKOFF_TOKEN')
  process.exit(1)
}

// Services

const logger = createLogger()
const cache = new CacheContainer(new MemoryStorage())

const client = createSdk(tinkoffHost, tinkoffToken, tinkoffApp, logger)

const accountsService = new AccountsService(client)
const instrumentsService = new InstrumentsService(client, cache)
const portfolioService = new PortfolioService(client)
const candlesService = new CandlesService(client, cache)
const ordersService = new OrdersService(client)
const operationsService = new OperationsService(client)
const marketService = new MarketService(client)

const availableCriterias = new AvailableCriterias([
  new None(),
  new Static(),
  new And(),
  new Or(),
  new Not(),
  new Greater(),
  new Less(),
  new Plus(),
  new Minus(),
  new Multiplication(),
  new Division(),
  new PriceClose(),
  new PricesHigh(),
  new PricesLow(),
  new PricesClose(),
  new LastBuyPrice(),
  new LastSellPrice(),
  new SMA(),
])

const robotsStorage = new FileRobotsStorage(path.resolve(__dirname, '../storage/robots'), availableCriterias)
const services = new Services(
  accountsService,
  candlesService,
  instrumentsService,
  ordersService,
  operationsService,
  portfolioService,
  marketService,
  cache,
  logger
)
const robotsPool = new RobotsPool(robotsStorage, services)

// HTTP API Server

const app = express()

app.use(cors())
app.use(bodyParser.json())

app.post('/auth', createAuthAction(authPassword, authSecret, authTimeout))

app.use('/api', createAuthMiddleware(authSecret))

app.get('/api', function (req, res) {
  res.json('API')
})

app.get('/api/accounts', function (req, res) {
  return accountsService
    .getAll()
    .then((accounts) => res.json(accounts))
    .catch((e) => res.status(500).json({ message: e.message }))
})

app.get('/api/accounts/:account', function (req, res) {
  return accountsService
    .get(req.params.account)
    .then((account) => res.json(account))
    .catch((e) => res.status(500).json({ message: e.message }))
})

app.post('/api/sandbox/accounts', function (req, res) {
  return accountsService
    .openSandboxAccount()
    .then(() => res.status(201).end())
    .catch((e) => res.status(500).json({ message: e.message }))
})

app.delete('/api/sandbox/accounts/:account', function (req, res) {
  return robotsPool
    .removeAllRobotsForAccount(req.params.account)
    .then(() => accountsService.closeSandboxAccount(req.params.account))
    .then(() => res.status(204).end())
    .catch((e) => res.status(500).json({ message: e.message }))
})

app.get('/api/accounts/:account/portfolio', function (req, res) {
  return accountsService
    .get(req.params.account)
    .then((account) => portfolioService.getPositions(account))
    .then(async (positions) =>
      Promise.all(
        positions.map((position) => {
          return instrumentsService.getByFigi(position.figi).then((instrument) => ({
            ...position,
            name: instrument.name,
            ticker: instrument.ticker,
          }))
        })
      )
    )
    .then((positions) => positions.sort((a, b) => a.name.localeCompare(b.name)))
    .then((positions) => res.json(positions))
    .catch((e) => res.status(500).json({ message: e.message }))
})

app.post('/api/accounts/:account/portfolio/sandbox-pay', function (req, res) {
  if (!req.body.amount) {
    return res.status(422).json({ message: 'Заполните сумму' })
  }
  if (!req.body.currency) {
    return res.status(422).json({ message: 'Заполните валюту' })
  }
  return accountsService
    .paySandboxAccount(req.params.account, req.body.amount, req.body.currency)
    .then(() => res.status(201).end())
    .catch((err) => res.status(500).json({ message: err.message }))
})

app.get('/api/robots', function (req, res) {
  const robots = robotsPool.viewAll()
  return Promise.all(
    robots.map((robot) => {
      return accountsService.get(robot.accountId).then((account) => {
        return instrumentsService.getByFigi(robot.figi).then((instrument) => ({
          ...robot,
          accountName: account.name,
          instrument: instrument.name,
        }))
      })
    })
  )
    .then((items) => items.sort((a, b) => a.name.localeCompare(b.name)))
    .then((items) => res.json(items))
    .catch((err) => res.status(500).json({ message: err.message }))
})

app.get('/api/accounts/:account/robots', function (req, res) {
  const robots = robotsPool.viewAllForAccount(req.params.account)
  return Promise.all(
    robots.map((robot) => {
      return instrumentsService.getByFigi(robot.figi).then((instrument) => ({
        ...robot,
        instrument: instrument.name,
      }))
    })
  )
    .then((items) => res.json(items))
    .catch((err) => res.status(500).json({ message: err.message }))
})

app.post('/api/accounts/:account/robots', function (req, res) {
  if (!req.body.figi) {
    return res.status(422).json({ message: 'Заполните FIGI' })
  }
  if (!req.body.name) {
    return res.status(422).json({ message: 'Заполните имя' })
  }
  if (!req.body.lots) {
    return res.status(422).json({ message: 'Заполните число лотов' })
  }
  return instrumentsService
    .getByFigi(req.body.figi)
    .then((instrument) => {
      if (!instrument.available) {
        throw new Error('Инструмент недоступен для торгов')
      }
      return instrument
    })
    .then((instrument) =>
      robotsPool.add(req.params.account, req.body.name, uuid(), instrument.figi, req.body.lots, req.body.from || null)
    )
    .then(() => res.status(201).end())
    .catch((err) => res.status(500).json({ message: err.message }))
})

app.get('/api/accounts/:account/robots/:robot', function (req, res) {
  const robot = robotsPool.view(req.params.account, req.params.robot)
  return instrumentsService
    .getByFigi(robot.figi)
    .then((instrument) =>
      res.json({
        ...robot,
        instrument: instrument.name,
      })
    )
    .catch((err) => res.status(500).json({ message: err.message }))
})

app.put('/api/accounts/:account/robots/:robot', function (req, res) {
  if (!req.body.figi) {
    return res.status(422).json({ message: 'Заполните FIGI' })
  }
  if (!req.body.name) {
    return res.status(422).json({ message: 'Заполните имя' })
  }
  if (!req.body.lots) {
    return res.status(422).json({ message: 'Заполните число лотов' })
  }
  return instrumentsService
    .getByFigi(req.body.figi)
    .then((instrument) => {
      if (!instrument.available) {
        throw new Error('Инструмент недоступен для торгов')
      }
      return instrument
    })
    .then((instrument) => {
      return robotsPool
        .edit(req.params.account, req.params.robot, req.body.name, instrument.figi, req.body.lots)
        .then(() => {
          if (req.body.from) {
            return robotsPool.copyStrategy(req.params.account, req.params.robot, req.body.from)
          }
        })
        .then(() => res.status(200).end())
        .catch((err) => res.status(500).json({ message: err.message }))
    })
})

app.delete('/api/accounts/:account/robots/:robot', function (req, res) {
  return robotsPool
    .remove(req.params.account, req.params.robot)
    .then(() => res.status(204).end())
    .catch((err) => res.status(500).json({ message: err.message }))
})

app.get('/api/criterias', function (req, res) {
  res.json(availableCriterias.getAllSchemas())
})

app.get('/api/accounts/:account/robots/:robot/strategy', function (req, res) {
  const strategy = robotsPool.viewStrategy(req.params.account, req.params.robot)
  res.json(strategy)
})

app.get('/api/accounts/:account/robots/:robot/operations', function (req, res) {
  const robot = robotsPool.view(req.params.account, req.params.robot)
  const from = new Date()
  from.setDate(from.getDate() - 1)
  return accountsService
    .get(req.params.account)
    .then((account) => operationsService.getAllExecuted(account, robot.figi, from, new Date()))
    .then((operations) => res.json(operations))
    .catch((e) => res.status(500).json({ message: e.message }))
})

app.get('/api/accounts/:account/robots/:robot/orders', function (req, res) {
  const robot = robotsPool.view(req.params.account, req.params.robot)
  const from = new Date()
  from.setDate(from.getDate() - 1)
  return accountsService
    .get(req.params.account)
    .then((account) => ordersService.getAllNew(account, robot.figi))
    .then((orders) => res.json(orders))
    .catch((e) => res.status(500).json({ message: e.message }))
})

app.delete('/api/accounts/:account/robots/:robot/strategy/criterias/:criteria', async function (req, res) {
  return robotsPool
    .changeStrategy(req.params.account, req.params.robot, (strategy: Strategy) => {
      return strategy.remove(req.params.criteria)
    })
    .then(() => res.end())
    .catch((err) => res.status(500).json({ message: err.message }))
})

app.put('/api/accounts/:account/robots/:robot/strategy/criterias/:criteria', async function (req, res) {
  if (!req.body.type) {
    return res.status(422).json({ message: 'Укажите тип критерия' })
  }
  const criteria = availableCriterias.get(req.body.type)
  return robotsPool
    .changeStrategy(req.params.account, req.params.robot, (strategy: Strategy) => {
      return strategy.replace(req.params.criteria, criteria, Params.fromJSON(req.body.params || []))
    })
    .then(() => res.status(201).end())
    .catch((err) => res.status(500).json({ message: err.message }))
})

app.post('/api/accounts/:account/robots/:robot/strategy/criterias/:criteria/wrap', async function (req, res) {
  if (!req.body.type) {
    return res.status(422).json({ message: 'Укажите тип критерия' })
  }
  const criteria = availableCriterias.get(req.body.type)
  return robotsPool
    .changeStrategy(req.params.account, req.params.robot, (strategy: Strategy) => {
      return strategy.wrap(req.params.criteria, criteria)
    })
    .then(() => res.status(201).end())
    .catch((err) => res.status(500).json({ message: err.message }))
})

app.post('/api/accounts/:account/robots/:robot/start', async function (req, res) {
  const from = new Date()
  from.setDate(from.getDate() - 3)
  return robotsPool
    .start(req.params.account, req.params.robot, from)
    .then(() => res.status(201).end())
    .catch((err) => res.status(500).json({ message: err.message }))
})

app.post('/api/accounts/:account/robots/:robot/stop', async function (req, res) {
  return robotsPool
    .stop(req.params.account, req.params.robot)
    .then(() => res.status(201).end())
    .catch((err) => res.status(500).json({ message: err.message }))
})

app.post('/api/accounts/:account/robots/:robot/buy', async function (req, res) {
  const robot = robotsPool.view(req.params.account, req.params.robot)
  return instrumentsService
    .getByFigi(robot.figi)
    .then(() => accountsService.get(req.params.account))
    .then((account) => ordersService.postOrder(account, robot.figi, true, robot.lots))
    .then(() => res.status(201).end())
    .catch((e) => res.status(500).json({ message: e.message }))
})

app.post('/api/accounts/:account/robots/:robot/sell', async function (req, res) {
  const robot = robotsPool.view(req.params.account, req.params.robot)
  return instrumentsService
    .getByFigi(robot.figi)
    .then(() => accountsService.get(req.params.account))
    .then((account) => ordersService.postOrder(account, robot.figi, false, robot.lots))
    .then(() => res.status(201).end())
    .catch((e) => res.status(500).json({ message: e.message }))
})

app.get('/api/accounts/:account/robots/:robot/back-test', async function (req, res) {
  const from = new Date()
  from.setDate(from.getDate() - 3)
  return robotsPool
    .backTest(req.params.account, req.params.robot, from)
    .then((results) => res.json(results))
    .catch((err) => res.status(500).json({ message: err.message }))
})

app.listen(process.env.PORT, () => {
  logger.info('Listening on port ' + process.env.PORT)
})
