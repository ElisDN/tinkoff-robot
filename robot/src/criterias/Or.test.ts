import Static from './Static'
import { Data, Metric } from '../robot/criteria'
import Or from './Or'

test('or metrics', () => {
  const criteria = new Or(new Static(11, 'id-1'), new Static(22, 'id-2'))
  const result = criteria.eval(Data.blank())
  expect(result.metrics).toEqual<Metric[]>([
    { id: 'id-1', name: 'Значение', value: 11 },
    { id: 'id-2', name: 'Значение', value: 22 },
  ])
})

test('or none', () => {
  const criteria = new Or(new Static(0), new Static(0))
  const result = criteria.eval(Data.blank())
  expect(result.value).toBe(0)
})

test('or first', () => {
  const criteria = new Or(new Static(4.06), new Static(0))
  const result = criteria.eval(Data.blank())
  expect(result.value).toBe(1)
})

test('or second', () => {
  const criteria = new Or(new Static(0), new Static(3))
  const result = criteria.eval(Data.blank())
  expect(result.value).toBe(1)
})

test('or both', () => {
  const criteria = new Or(new Static(5.2), new Static(1.6))
  const result = criteria.eval(Data.blank())
  expect(result.value).toBe(1)
})
