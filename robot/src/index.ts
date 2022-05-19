import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import createSdk from './tinkoff/client'
import AccountsService from './tinkoff/service/accounts'
import PortfolioService from './tinkoff/service/portfolio'
import RobotsService from './robot/robotsService'
import { v4 } from 'uuid'
import { FileRobotsStorage } from './robot/robotsStorage'
import * as path from 'path'
import CandlesService from './tinkoff/service/candles'

dotenv.config()

const authSecret = process.env.AUTH_SECRET
if (!authSecret) {
  throw new Error('AUTH_SECRET env is not set')
}

const authPassword = process.env.AUTH_PASSWORD
if (!authPassword) {
  throw new Error('AUTH_PASSWORD env is not set')
}

const tinkoffToken = process.env.TINKOFF_TOKEN
if (!tinkoffToken) {
  throw new Error('TINKOFF_TOKEN env is not set')
}

const client = createSdk('invest-public-api.tinkoff.ru:443', tinkoffToken, 'ElisDN')

const accountsService = new AccountsService(client)
const portfolioService = new PortfolioService(client)
const candlesService = new CandlesService(client)

const robotsStorage = new FileRobotsStorage(path.resolve(__dirname, '../var/robots'))
const robotsService = new RobotsService(robotsStorage)

const app = express()

app.use(cors())
app.use(bodyParser.json())

app.post('/auth', (req, res) => {
  if (!req.body.password) {
    return res.status(422).json({ message: 'Заполните пароль' })
  }
  if (req.body.password !== authPassword) {
    return res.status(409).json({ message: 'Неверный пароль' })
  }
  const expires = 3600 * 4
  const token = jwt.sign({}, authSecret, { expiresIn: expires })
  res.status(200).json({ token, expires })
})

app.use('/api', (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401)
  }
  const token = req.headers.authorization.split(' ')[1]
  jwt.verify(token, authSecret, (err) => (err ? res.status(401) : next()))
})

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
  res.status(201)
})

app.delete('/api/sandbox/accounts/:account', async function (req, res) {
  await accountsService.closeSandboxAccount(req.params.account)
  res.status(204)
})

app.get('/api/accounts/:account/portfolio', async function (req, res) {
  const account = await accountsService.get(req.params.account)
  const positions = await portfolioService.getPositions(account)
  res.json(positions)
})

app.get('/api/accounts/:account/robots', async function (req, res) {
  const robots = robotsService.getAll(req.params.account)
  res.json(
    robots.map((robot) => ({
      id: robot.getId(),
      figi: robot.getFigi(),
    }))
  )
})

app.post('/api/accounts/:account/robots', async function (req, res) {
  if (!req.body.figi) {
    return res.status(422).json({ message: 'Заполните FIGI' })
  }
  robotsService
    .create(req.params.account, v4(), req.body.figi)
    .then(() => res.status(201))
    .catch((err) => res.status(400).json({ message: err.message }))
})

app.get('/api/accounts/:account/robots/:robot', async function (req, res) {
  const robot = robotsService.get(req.params.account, req.params.robot)
  res.json({
    id: robot.getId(),
    figi: robot.getFigi(),
  })
})

app.delete('/api/accounts/:account/robots/:robot', async function (req, res) {
  robotsService
    .remove(req.params.account, req.params.robot)
    .then(() => res.status(204))
    .catch((err) => res.status(400).json({ message: err.message }))
})

app.get('/api/accounts/:account/robots/:robot/candles', async function (req, res) {
  const robot = robotsService.get(req.params.account, req.params.robot)
  const date = new Date()
  date.setDate(date.getDate() - 1)
  candlesService
    .getFrom(robot.getFigi(), date)
    .then((candles) => res.json(candles))
    .catch((err) => res.status(500).json({ message: err.message }))
})

app.listen(process.env.PORT, () => {
  console.log('Listening on port ' + process.env.PORT)
})
