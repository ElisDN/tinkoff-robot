import { OrderRequest, Strategy } from './strategy'
import Less from '../criterias/Less'
import PriceClose from '../criterias/PriceClose'
import Greater from '../criterias/Greater'
import { Input, Inputs, Node, Params } from './node'
import { Data, Metric } from './trading'

const strategy = new Strategy(
  new Node(
    'id-1',
    new Less(),
    Params.blank(),
    new Inputs([
      new Input('one', new Node('id-2', new PriceClose(), Params.blank(), Inputs.blank())),
      new Input('two', Node.forStatic('id-3', 100)),
    ])
  ),
  new Node(
    'id-4',
    new Greater(),
    Params.blank(),
    new Inputs([
      new Input('one', new Node('id-5', new PriceClose(), Params.blank(), Inputs.blank())),
      new Input('two', Node.forStatic('id-6', 200)),
    ])
  )
)

test('strategy eval metrics', () => {
  const data = Data.blank().withPrice(150)
  const result = strategy.eval(data)

  expect(result.metrics).toEqual<Metric[]>([
    { id: 'id-6', name: 'Значение', value: 200 },
    { id: 'id-3', name: 'Значение', value: 100 },
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
    figi: 'F1',
    date: new Date(),
    buy: true,
    lots: 1,
    price: 140,
    comission: 1,
  })
  const result = strategy.eval(data)

  expect(result.request).toBe(null)
})

test('strategy eval middle with sell order', () => {
  const data = Data.blank().withPrice(150).withOrder({
    id: '1',
    figi: 'F1',
    date: new Date(),
    buy: false,
    lots: 1,
    price: 140,
    comission: 1,
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
    figi: 'F1',
    date: new Date(),
    buy: true,
    lots: 1,
    price: 80,
    comission: 1,
  })
  const result = strategy.eval(data)

  expect(result.request).toBe(null)
})

test('strategy eval buy with sell order', () => {
  const data = Data.blank().withPrice(50).withOrder({
    id: '1',
    figi: 'F1',
    date: new Date(),
    buy: false,
    lots: 1,
    price: 80,
    comission: 1,
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
    figi: 'F1',
    date: new Date(),
    buy: true,
    lots: 1,
    price: 80,
    comission: 1,
  })
  const result = strategy.eval(data)

  expect(result.request).toEqual<OrderRequest>({ buy: false })
})

test('strategy eval sell with sell order', () => {
  const data = Data.blank().withPrice(250).withOrder({
    id: '1',
    figi: 'F1',
    date: new Date(),
    buy: false,
    lots: 1,
    price: 180,
    comission: 1,
  })
  const result = strategy.eval(data)

  expect(result.request).toBe(null)
})
