import { OrderRequest, Strategy } from './strategy'
import Less from '../criterias/Less'
import Static from '../criterias/Static'
import Price from '../criterias/Price'
import { Data, Metric } from './criteria'
import Greater from '../criterias/Greater'

test('strategy eval metrics', () => {
  const strategy = new Strategy(
    new Less(new Price('id-1'), new Static(100, 'id-2')),
    new Greater(new Price('id-3'), new Static(200, 'id-4'))
  )
  const data = Data.blank().withPrice(150)
  const result = strategy.eval(data)

  expect(result.metrics).toEqual<Metric[]>([
    { id: 'id-1', name: 'Цена', value: 150 },
    { id: 'id-2', name: 'Значение', value: 100 },
    { id: 'id-3', name: 'Цена', value: 150 },
    { id: 'id-4', name: 'Значение', value: 200 },
  ])
})

test('strategy eval middle without order', () => {
  const strategy = new Strategy(new Less(new Price(), new Static(100)), new Greater(new Price(), new Static(200)))
  const data = Data.blank().withPrice(150)
  const result = strategy.eval(data)

  expect(result.request).toBe(null)
})

test('strategy eval middle with buy order', () => {
  const strategy = new Strategy(new Less(new Price(), new Static(100)), new Greater(new Price(), new Static(200)))
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
  const strategy = new Strategy(new Less(new Price(), new Static(100)), new Greater(new Price(), new Static(200)))
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
  const strategy = new Strategy(new Less(new Price(), new Static(100)), new Greater(new Price(), new Static(200)))
  const data = Data.blank().withPrice(50)
  const result = strategy.eval(data)

  expect(result.request).toEqual<OrderRequest>({ buy: true })
})

test('strategy eval buy with buy order', () => {
  const strategy = new Strategy(new Less(new Price(), new Static(100)), new Greater(new Price(), new Static(200)))
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
  const strategy = new Strategy(new Less(new Price(), new Static(100)), new Greater(new Price(), new Static(200)))
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
  const strategy = new Strategy(new Less(new Price(), new Static(100)), new Greater(new Price(), new Static(200)))
  const data = Data.blank().withPrice(250)
  const result = strategy.eval(data)

  expect(result.request).toBe(null)
})

test('strategy eval sell with buy order', () => {
  const strategy = new Strategy(new Less(new Price(), new Static(100)), new Greater(new Price(), new Static(200)))
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
  const strategy = new Strategy(new Less(new Price(), new Static(100)), new Greater(new Price(), new Static(200)))
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
