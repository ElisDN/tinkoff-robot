import Static from './Static'
import { Data, Metric } from '../robot/criteria'
import Greater from './Greater'

test('greater metrics', () => {
  const criteria = new Greater(new Static(11, 'id-1'), new Static(22, 'id-2'))
  const result = criteria.eval(Data.blank())
  expect(result.metrics).toEqual<Metric[]>([
    { id: 'id-1', name: 'Значение', value: 11 },
    { id: 'id-2', name: 'Значение', value: 22 },
  ])
})

test('greater true', () => {
  const criteria = new Greater(new Static(5.2), new Static(3.6))
  const result = criteria.eval(Data.blank())
  expect(result.value).toBe(1)
})

test('greater false', () => {
  const criteria = new Greater(new Static(4.06), new Static(6.12))
  const result = criteria.eval(Data.blank())
  expect(result.value).toBe(0)
})

test('greater equal', () => {
  const criteria = new Greater(new Static(4.01), new Static(4.01))
  const result = criteria.eval(Data.blank())
  expect(result.value).toBe(0)
})
