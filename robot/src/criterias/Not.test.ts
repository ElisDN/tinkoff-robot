import Not from './Not'
import { Data, Metric } from '../robot/criteria'
import { Input, Inputs, Params } from '../robot/node'

test('not metrics', () => {
  const criteria = new Not()
  const result = criteria.eval('id-1', Data.blank(), Params.blank(), new Inputs([Input.forStatic('id-2', 'that', 11)]))
  expect(result.metrics).toEqual<Metric[]>([{ id: 'id-2', name: 'Значение', value: 11 }])
})

test('not true', () => {
  const criteria = new Not()
  const result = criteria.eval('id-1', Data.blank(), Params.blank(), new Inputs([Input.forStatic('id-2', 'that', 1)]))
  expect(result.value).toBe(0)
})

test('not false', () => {
  const criteria = new Not()
  const result = criteria.eval('id-1', Data.blank(), Params.blank(), new Inputs([Input.forStatic('id-2', 'that', 0)]))
  expect(result.value).toBe(1)
})
