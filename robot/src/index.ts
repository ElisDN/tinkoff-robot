import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors())

app.get('/', function (req, res) {
  res.json('API')
})

app.listen(3001, () => {
  console.log('Listening on port 3001')
})
