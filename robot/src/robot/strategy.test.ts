import { OrderRequest, Strategy } from './strategy'
import Less from '../criterias/Less'
import Price from '../criterias/Price'
import Greater from '../criterias/Greater'
import { Input, Inputs, Node, Params } from './node'
import { Data, Metric } from './trading'

const strategy = new Strategy(
  new Node(
    'id-1',
    new Less(),
    Params.blank(),
    new Inputs([
      new Input('that', new Node('id-2', new Price(), Params.blank(), Inputs.blank())),
      new Input('than', Node.forStatic('id-3', 100)),
    ])
  ),
  new Node(
    'id-4',
    new Greater(),
    Params.blank(),
    new Inputs([
      new Input('that', new Node('id-5', new Price(), Params.blank(), Inputs.blank())),
      new Input('than', Node.forStatic('id-6', 200)),
    ])
  )
)

test('strategy eval metrics', () => {
  const data = Data.blank().withPrice(150)
  const result = strategy.eval(data)

  expect(result.metrics).toEqual<Metric[]>([
    { id: 'id-2', name: 'Цена', value: 150 },
    { id: 'id-3', name: 'Значение', value: 100 },
    { id: 'id-5', name: 'Цена', value: 150 },
    { id: 'id-6', name: 'Значение', value: 200 },
  ])
})

test('strategy eval middle without order', () => {
  const data = Data.blank().withPrice(150)
  const result = strategy.eval(data)

  expect(result.request).toBe(null)
})

test('strategy eval middle with buy order', () => {
  const data = Data.blank().withPrice(150).withOrder({
    id: '1',
    date: new Date(),
    buy: true,
    lots: 1,
    price: 140,
  })
  const result = strategy.eval(data)

  expect(result.request).toBe(null)
})

test('strategy eval middle with sell order', () => {
  const data = Data.blank().withPrice(150).withOrder({
    id: '1',
    date: new Date(),
    buy: false,
    lots: 1,
    price: 140,
  })
  const result = strategy.eval(data)

  expect(result.request).toBe(null)
})

test('strategy eval buy without order', () => {
  const data = Data.blank().withPrice(50)
  const result = strategy.eval(data)

  expect(result.request).toEqual<OrderRequest>({ buy: true })
})

test('strategy eval buy with buy order', () => {
  const data = Data.blank().withPrice(50).withOrder({
    id: '1',
    date: new Date(),
    buy: true,
    lots: 1,
    price: 80,
  })
  const result = strategy.eval(data)

  expect(result.request).toBe(null)
})

test('strategy eval buy with sell order', () => {
  const data = Data.blank().withPrice(50).withOrder({
    id: '1',
    date: new Date(),
    buy: false,
    lots: 1,
    price: 80,
  })
  const result = strategy.eval(data)

  expect(result.request).toEqual<OrderRequest>({ buy: true })
})

test('strategy eval sell without order', () => {
  const data = Data.blank().withPrice(250)
  const result = strategy.eval(data)

  expect(result.request).toBe(null)
})

test('strategy eval sell with buy order', () => {
  const data = Data.blank().withPrice(250).withOrder({
    id: '1',
    date: new Date(),
    buy: true,
    lots: 1,
    price: 80,
  })
  const result = strategy.eval(data)

  expect(result.request).toEqual<OrderRequest>({ buy: false })
})

test('strategy eval sell with sell order', () => {
  const data = Data.blank().withPrice(250).withOrder({
    id: '1',
    date: new Date(),
    buy: false,
    lots: 1,
    price: 180,
  })
  const result = strategy.eval(data)

  expect(result.request).toBe(null)
})
