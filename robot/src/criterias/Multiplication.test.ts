import Multiplication from './Multiplication'
import { Input, Inputs, Params } from '../robot/node'
import { Data, Metric } from '../robot/trading'

test('multiplication metrics', () => {
  const criteria = new Multiplication()
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

test('multiplication', () => {
  const criteria = new Multiplication()
  const result = criteria.eval(
    'id-1',
    Data.blank(),
    Params.blank(),
    new Inputs([Input.forStatic('id-2', 'one', 5.2), Input.forStatic('id-3', 'two', 2)])
  )
  expect(result.value).toBe(10.4)
})
