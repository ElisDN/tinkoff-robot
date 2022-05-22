import Static from './Static'
import { Data, Metric } from '../robot/criteria'
import Less from './Less'

test('less metrics', () => {
  const criteria = new Less(new Static(11, 'id-1'), new Static(22, 'id-2'))
  const result = criteria.eval(Data.blank())
  expect(result.metrics).toEqual<Metric[]>([
    { id: 'id-1', name: 'Значение', value: 11 },
    { id: 'id-2', name: 'Значение', value: 22 },
  ])
})

test('less true', () => {
  const criteria = new Less(new Static(2.1), new Static(3.6))
  const result = criteria.eval(Data.blank())
  expect(result.value).toBe(1)
})

test('less false', () => {
  const criteria = new Less(new Static(14.06), new Static(6.12))
  const result = criteria.eval(Data.blank())
  expect(result.value).toBe(0)
})

test('less equal', () => {
  const criteria = new Less(new Static(4.02), new Static(4.02))
  const result = criteria.eval(Data.blank())
  expect(result.value).toBe(0)
})
