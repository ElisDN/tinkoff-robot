import Plus from './Plus'
import { Input, Inputs, Params } from '../robot/node'
import { Data, Metric } from '../robot/trading'

test('plus metrics', () => {
  const criteria = new Plus()
  const result = criteria.eval(
    'id-1',
    Data.blank(),
    Params.blank(),
    new Inputs([Input.forStatic('id-2', 'one', 11), Input.forStatic('id-3', 'two', 22)])
  )
  expect(result.metrics).toEqual<Metric[]>([
    { id: 'id-2', name: 'Значение', value: 11 },
    { id: 'id-3', name: 'Значение', value: 22 },
    { id: 'id-1', name: 'Плюс', value: 33 },
  ])
})

test('plus', () => {
  const criteria = new Plus()
  const result = criteria.eval(
    'id-1',
    Data.blank(),
    Params.blank(),
    new Inputs([Input.forStatic('id-2', 'one', 5.2), Input.forStatic('id-3', 'two', 3.6)])
  )
  expect(result.value).toBe(8.8)
})
