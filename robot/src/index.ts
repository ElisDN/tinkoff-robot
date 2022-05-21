import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import createSdk from './sdk/client'
import AccountsService from './service/accounts'
import PortfolioService from './service/portfolio'
import RobotsPool from './robot/robotsPool'
import { v4 as uuid } from 'uuid'
import { FileRobotsStorage } from './robot/robotsStorage'
import * as path from 'path'
import CandlesService from './service/candles'
import createLogger from './logger'
import { createAuthAction, createAuthMiddleware } from './auth'
import Greater from './criterias/Greater'
import None from './criterias/None'
import Static from './criterias/Static'
import Price from './criterias/Price'
import Less from './criterias/Less'
import { CriteriaCreator } from './robot/criteriaCreator'
import { Strategy } from './robot/strategy'
import And from './criterias/And'
import Or from './criterias/Or'
import Not from './criterias/Not'
import { CacheContainer } from 'node-ts-cache'
import { MemoryStorage } from 'node-ts-cache-storage-memory'

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
const portfolioService = new PortfolioService(client)
const candlesService = new CandlesService(client, cache)

const criteriaCreator = new CriteriaCreator([
  { schema: And.getSchema(), fromJSON: And.fromJSON, fromJSONParams: And.fromJSONParams },
  { schema: Or.getSchema(), fromJSON: Or.fromJSON, fromJSONParams: Or.fromJSONParams },
  { schema: Not.getSchema(), fromJSON: Not.fromJSON, fromJSONParams: Not.fromJSONParams },
  { schema: None.getSchema(), fromJSON: None.fromJSON, fromJSONParams: None.fromJSONParams },
  { schema: Static.getSchema(), fromJSON: Static.fromJSON, fromJSONParams: Static.fromJSONParams },
  { schema: Price.getSchema(), fromJSON: Price.fromJSON, fromJSONParams: Price.fromJSONParams },
  { schema: Greater.getSchema(), fromJSON: Greater.fromJSON, fromJSONParams: Greater.fromJSONParams },
  { schema: Less.getSchema(), fromJSON: Less.fromJSON, fromJSONParams: Less.fromJSONParams },
])

const robotsStorage = new FileRobotsStorage(path.resolve(__dirname, '../storage/robots'), criteriaCreator)
const robotsService = new RobotsPool(robotsStorage)

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
  await accountsService.closeSandboxAccount(req.params.account)
  res.status(204).end()
})

app.get('/api/accounts/:account/portfolio', async function (req, res) {
  const account = await accountsService.get(req.params.account)
  const positions = await portfolioService.getPositions(account)
  res.json(positions)
})

app.get('/api/accounts/:account/robots', async function (req, res) {
  const robots = robotsService.viewAll(req.params.account)
  res.json(robots)
})

app.post('/api/accounts/:account/robots', async function (req, res) {
  if (!req.body.figi) {
    return res.status(422).json({ message: 'Заполните FIGI' })
  }
  robotsService
    .add(req.params.account, uuid(), req.body.figi)
    .then(() => res.status(201).end())
    .catch((err) => res.status(400).json({ message: err.message }))
})

app.get('/api/accounts/:account/robots/:robot', async function (req, res) {
  const robot = robotsService.view(req.params.account, req.params.robot)
  res.json(robot)
})

app.delete('/api/accounts/:account/robots/:robot', async function (req, res) {
  robotsService
    .remove(req.params.account, req.params.robot)
    .then(() => res.status(204).end())
    .catch((err) => res.status(400).json({ message: err.message }))
})

app.get('/api/criterias', async function (req, res) {
  res.json(criteriaCreator.getAvailableSchemas())
})

app.get('/api/accounts/:account/robots/:robot/strategy', async function (req, res) {
  const strategy = robotsService.viewStrategy(req.params.account, req.params.robot)
  res.json(strategy)
})

app.delete('/api/accounts/:account/robots/:robot/strategy/:criteria', async function (req, res) {
  await robotsService.changeStrategy(req.params.account, req.params.robot, (strategy: Strategy) => {
    return strategy.without(req.params.criteria)
  })
  res.end()
})

app.put('/api/accounts/:account/robots/:robot/strategy/:criteria', async function (req, res) {
  if (!req.body.type) {
    return res.status(422).json({ message: 'Укажите тип критерия' })
  }
  const criteria = criteriaCreator.createCriteria(req.body.type, req.body.params || [])
  await robotsService.changeStrategy(req.params.account, req.params.robot, (strategy: Strategy) => {
    return strategy.with(req.params.criteria, criteria)
  })
  res.status(201).end()
})

app.get('/api/accounts/:account/robots/:robot/candles', async function (req, res) {
  const robot = robotsService.view(req.params.account, req.params.robot)
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
