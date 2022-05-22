import Not from './Not'
import Static from './Static'
import { Data, Metric } from '../robot/criteria'

test('not metrics', () => {
  const criteria = new Not(new Static(11, 'id-1'))
  const result = criteria.eval(Data.blank())
  expect(result.metrics).toEqual<Metric[]>([{ id: 'id-1', name: 'Значение', value: 11 }])
})

test('not true', () => {
  const criteria = new Not(new Static(1))
  const result = criteria.eval(Data.blank())
  expect(result.value).toBe(0)
})

test('not false', () => {
  const criteria = new Not(new Static(0))
  const result = criteria.eval(Data.blank())
  expect(result.value).toBe(1)
})
