import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import createSdk from './tinkoff/client'
import createUsers from './tinkoff/service/users'

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

const isSandbox = process.env.IS_SANDBOX === '1'

const client = createSdk('invest-public-api.tinkoff.ru:443', tinkoffToken, 'ElisDN')

const users = createUsers(client, isSandbox)

const app = express()

app.use(cors())
app.use(bodyParser.json())

app.post('/auth', (req, res) => {
  if (req.body.password === authPassword) {
    return res.status(200).json({
      token: jwt.sign({ id: 0 }, authSecret, { expiresIn: 3600 }),
      expires: 3600,
    })
  }
  return res.status(409).json({ message: 'Incorrect password' })
})

app.use('/api', (req, res, next) => {
  if (!req.headers.authorization) {
    res.status(401).json({ message: 'Not authorized' })
    return
  }
  const token = req.headers.authorization.split(' ')[1]
  jwt.verify(token, authSecret, (err) => {
    if (err) {
      res.status(401).json({ message: 'Not authorized' })
    } else {
      next()
    }
  })
})

app.get('/api', function (req, res) {
  res.json('API')
})

app.get('/api/accounts', async function (req, res) {
  try {
    const accounts = await users.getAccounts()
    res.json(accounts)
  } catch (e) {
    console.error(e)
    res.status(500).json(e)
  }
})

app.listen(process.env.PORT, () => {
  console.log('Listening on port ' + process.env.PORT)
})
