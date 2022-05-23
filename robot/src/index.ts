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
import Price from './criterias/Price'
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

const availableCriterias = new AvailableCriterias([
  new None(),
  new And(),
  new Or(),
  new Not(),
  new Greater(),
  new Less(),
  new Static(),
  new Price(),
])

const robotsStorage = new FileRobotsStorage(path.resolve(__dirname, '../storage/robots'), availableCriterias)
const robotsPool = new RobotsPool(robotsStorage)

// HTTP API Server

const app = express()

app.use(cors())
app.use(bodyParser.json())

app.post('/auth', createAuthAction(authPassword, authSecret, authTimeout))

app.use('/api', createAuthMiddleware(authSecret))

app.get('/api', function (req, res) {
  res.json('API')
})

app.get('/api/accounts', async function (req, res) {
  const accounts = await accountsService.getAll()
  res.json(accounts)
})

app.get('/api/accounts/:account', async function (req, res) {
  const account = await accountsService.get(req.params.account)
  res.json(account)
})

app.post('/api/sandbox/accounts', async function (req, res) {
  await accountsService.openSandboxAccount()
  res.status(201).end()
})

app.delete('/api/sandbox/accounts/:account', async function (req, res) {
  await robotsPool.removeAllRobotsForAccout(req.params.account)
  await accountsService.closeSandboxAccount(req.params.account)
  res.status(204).end()
})

app.get('/api/accounts/:account/portfolio', async function (req, res) {
  const account = await accountsService.get(req.params.account)
  const positions = await portfolioService.getPositions(account)
  res.json(
    (
      await Promise.all(
        positions.map(async (position) => {
          return instrumentsService.getByFigi(position.figi).then((instrument) => ({
            ...position,
            name: instrument.name,
            ticker: instrument.ticker,
          }))
        })
      )
    ).sort((a, b) => a.name.localeCompare(b.name))
  )
})

app.post('/api/accounts/:account/portfolio/sandbox-pay', function (req, res) {
  if (!req.body.amount) {
    return res.status(422).json({ message: 'Заполните сумму' })
  }
  if (!req.body.currency) {
    return res.status(422).json({ message: 'Заполните валюту' })
  }
  accountsService
    .paySandboxAccount(req.params.account, req.body.amount, req.body.currency)
    .then(() => res.status(201).end())
    .catch((err) => res.status(400).json({ message: err.message }))
})

app.get('/api/robots', async function (req, res) {
  const robots = robotsPool.viewAll()
  res.json(
    await Promise.all(
      robots.map(async (robot) => {
        return accountsService.get(robot.accountId).then((account) => {
          return instrumentsService.getByFigi(robot.figi).then((instrument) => ({
            ...robot,
            accountName: account.name,
            instrument: instrument.name,
          }))
        })
      })
    )
  )
})

app.get('/api/accounts/:account/robots', async function (req, res) {
  const robots = robotsPool.viewAllForAccount(req.params.account)
  res.json(
    await Promise.all(
      robots.map(async (robot) => {
        return instrumentsService.getByFigi(robot.figi).then((instrument) => ({
          ...robot,
          instrument: instrument.name,
        }))
      })
    )
  )
})

app.post('/api/accounts/:account/robots', function (req, res) {
  if (!req.body.figi) {
    return res.status(422).json({ message: 'Заполните FIGI' })
  }
  if (!req.body.name) {
    return res.status(422).json({ message: 'Заполните имя' })
  }
  robotsPool
    .add(req.params.account, req.body.name, uuid(), req.body.figi, req.body.from || null)
    .then(() => res.status(201).end())
    .catch((err) => res.status(400).json({ message: err.message }))
})

app.get('/api/accounts/:account/robots/:robot', async function (req, res) {
  const robot = robotsPool.view(req.params.account, req.params.robot)
  const instrument = await instrumentsService.getByFigi(robot.figi)
  res.json({
    ...robot,
    instrument: instrument.name,
  })
})

app.delete('/api/accounts/:account/robots/:robot', function (req, res) {
  robotsPool
    .remove(req.params.account, req.params.robot)
    .then(() => res.status(204).end())
    .catch((err) => res.status(400).json({ message: err.message }))
})

app.get('/api/criterias', function (req, res) {
  res.json(availableCriterias.getAllSchemas())
})

app.get('/api/accounts/:account/robots/:robot/strategy', function (req, res) {
  const strategy = robotsPool.viewStrategy(req.params.account, req.params.robot)
  res.json(strategy)
})

app.delete('/api/accounts/:account/robots/:robot/strategy/criterias/:criteria', async function (req, res) {
  await robotsPool.changeStrategy(req.params.account, req.params.robot, (strategy: Strategy) => {
    return strategy.remove(req.params.criteria)
  })
  res.end()
})

app.put('/api/accounts/:account/robots/:robot/strategy/criterias/:criteria', async function (req, res) {
  if (!req.body.type) {
    return res.status(422).json({ message: 'Укажите тип критерия' })
  }
  const criteria = availableCriterias.get(req.body.type)
  await robotsPool.changeStrategy(req.params.account, req.params.robot, (strategy: Strategy) => {
    return strategy.replace(req.params.criteria, criteria, Params.fromJSON(req.body.params || []))
  })
  res.status(201).end()
})

app.get('/api/accounts/:account/robots/:robot/chart', async function (req, res) {
  const robot = robotsPool.view(req.params.account, req.params.robot)
  const from = new Date()
  from.setDate(from.getDate() - 4)
  candlesService
    .get(robot.figi, from, new Date())
    .then((candles) => res.json(candles))
    .catch((err) => res.status(500).json({ message: err.message }))
})

app.listen(process.env.PORT, () => {
  logger.info('Listening on port ' + process.env.PORT)
})
