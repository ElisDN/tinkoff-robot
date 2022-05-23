import Less from './Less'
import { Input, Inputs, Params } from '../robot/node'
import { Data, Metric } from '../robot/trading'

test('less metrics', () => {
  const criteria = new Less()
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

test('less true', () => {
  const criteria = new Less()
  const result = criteria.eval(
    'id-1',
    Data.blank(),
    Params.blank(),
    new Inputs([Input.forStatic('id-2', 'one', 2.1), Input.forStatic('id-3', 'two', 3.6)])
  )
  expect(result.value).toBe(1)
})

test('less false', () => {
  const criteria = new Less()
  const result = criteria.eval(
    'id-1',
    Data.blank(),
    Params.blank(),
    new Inputs([Input.forStatic('id-2', 'one', 14.06), Input.forStatic('id-3', 'two', 6.12)])
  )
  expect(result.value).toBe(0)
})

test('less equal', () => {
  const criteria = new Less()
  const result = criteria.eval(
    'id-1',
    Data.blank(),
    Params.blank(),
    new Inputs([Input.forStatic('id-2', 'one', 4.02), Input.forStatic('id-3', 'two', 4.02)])
  )
  expect(result.value).toBe(0)
})
