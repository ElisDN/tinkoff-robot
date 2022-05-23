import { Input, Inputs, Params } from '../robot/node'
import { Data, Metric } from '../robot/trading'
import Minus from './Minus'

test('minus metrics', () => {
  const criteria = new Minus()
  const result = criteria.eval(
    'id-1',
    Data.blank(),
    Params.blank(),
    new Inputs([Input.forStatic('id-2', 'one', 22), Input.forStatic('id-3', 'two', 10)])
  )
  expect(result.metrics).toEqual<Metric[]>([
    { id: 'id-2', name: 'Значение', value: 22 },
    { id: 'id-3', name: 'Значение', value: 10 },
    { id: 'id-1', name: 'Минус', value: 12 },
  ])
})

test('minus', () => {
  const criteria = new Minus()
  const result = criteria.eval(
    'id-1',
    Data.blank(),
    Params.blank(),
    new Inputs([Input.forStatic('id-2', 'one', 5.2), Input.forStatic('id-3', 'two', 3.6)])
  )
  expect(result.value).toBe(1.6)
})
