import Or from './Or'
import { Input, Inputs, Params } from '../robot/node'
import { Data, Metric } from '../robot/trading'

test('or metrics', () => {
  const criteria = new Or()
  const result = criteria.eval(
    'id-1',
    Data.blank(),
    Params.blank(),
    new Inputs([Input.forStatic('id-2', 'one', 11), Input.forStatic('id-3', 'two', 22)])
  )
  expect(result.metrics).toEqual<Metric[]>([
    { id: 'id-2', name: 'Значение', value: 11 },
    { id: 'id-3', name: 'Значение', value: 22 },
  ])
})

test('or none', () => {
  const criteria = new Or()
  const result = criteria.eval(
    'id-1',
    Data.blank(),
    Params.blank(),
    new Inputs([Input.forStatic('id-2', 'one', 0), Input.forStatic('id-3', 'two', 0)])
  )
  expect(result.value).toBe(0)
})

test('or first', () => {
  const criteria = new Or()
  const result = criteria.eval(
    'id-1',
    Data.blank(),
    Params.blank(),
    new Inputs([Input.forStatic('id-2', 'one', 4.06), Input.forStatic('id-3', 'two', 0)])
  )
  expect(result.value).toBe(1)
})

test('or second', () => {
  const criteria = new Or()
  const result = criteria.eval(
    'id-1',
    Data.blank(),
    Params.blank(),
    new Inputs([Input.forStatic('id-2', 'one', 0), Input.forStatic('id-3', 'two', 3)])
  )
  expect(result.value).toBe(1)
})

test('or both', () => {
  const criteria = new Or()
  const result = criteria.eval(
    'id-1',
    Data.blank(),
    Params.blank(),
    new Inputs([Input.forStatic('id-2', 'one', 5.2), Input.forStatic('id-3', 'two', -1.6)])
  )
  expect(result.value).toBe(1)
})
