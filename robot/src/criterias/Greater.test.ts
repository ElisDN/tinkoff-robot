import Static from './Static'
import { Data, Result } from '../robot/criteria'
import Greater from './Greater'

test('greater true', () => {
  const criteria = new Greater(new Static(5.2), new Static(3.6))
  const result = criteria.eval(Data.blank(), Result.of(5))
  expect(result.value).toBe(1)
})

test('greater false', () => {
  const criteria = new Greater(new Static(4.06), new Static(6.12))
  const result = criteria.eval(Data.blank(), Result.of(5))
  expect(result.value).toBe(0)
})

test('greater equal', () => {
  const criteria = new Greater(new Static(4.01), new Static(4.01))
  const result = criteria.eval(Data.blank(), Result.of(5))
  expect(result.value).toBe(0)
})
