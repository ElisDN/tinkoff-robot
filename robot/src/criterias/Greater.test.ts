import Greater from './Greater'
import { Input, Inputs, Params } from '../robot/node'
import { Data, Metric } from '../robot/trading'

test('greater metrics', () => {
  const criteria = new Greater()
  const result = criteria.eval(
    'id-1',
    Data.blank(),
    Params.blank(),
    new Inputs([Input.forStatic('id-2', 'that', 11), Input.forStatic('id-3', 'than', 22)])
  )
  expect(result.metrics).toEqual<Metric[]>([
    { id: 'id-2', name: 'Значение', value: 11 },
    { id: 'id-3', name: 'Значение', value: 22 },
  ])
})

test('greater true', () => {
  const criteria = new Greater()
  const result = criteria.eval(
    'id-1',
    Data.blank(),
    Params.blank(),
    new Inputs([Input.forStatic('id-2', 'that', 5.2), Input.forStatic('id-3', 'than', 3.6)])
  )
  expect(result.value).toBe(1)
})

test('greater false', () => {
  const criteria = new Greater()
  const result = criteria.eval(
    'id-1',
    Data.blank(),
    Params.blank(),
    new Inputs([Input.forStatic('id-2', 'that', 4.06), Input.forStatic('id-3', 'than', 6.12)])
  )
  expect(result.value).toBe(0)
})

test('greater equal', () => {
  const criteria = new Greater()
  const result = criteria.eval(
    'id-1',
    Data.blank(),
    Params.blank(),
    new Inputs([Input.forStatic('id-2', 'that', 4.01), Input.forStatic('id-3', 'than', 4.01)])
  )
  expect(result.value).toBe(0)
})
