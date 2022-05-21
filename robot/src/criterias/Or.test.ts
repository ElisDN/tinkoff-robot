import Static from './Static'
import { Data, Result } from '../robot/criteria'
import Or from './Or'

test('or none', () => {
  const criteria = new Or(new Static(0), new Static(0))
  const result = criteria.eval(Data.blank(), Result.of(5))
  expect(result.value).toBe(0)
})

test('or first', () => {
  const criteria = new Or(new Static(4.06), new Static(0))
  const result = criteria.eval(Data.blank(), Result.of(5))
  expect(result.value).toBe(1)
})

test('or second', () => {
  const criteria = new Or(new Static(0), new Static(3))
  const result = criteria.eval(Data.blank(), Result.of(5))
  expect(result.value).toBe(1)
})

test('or both', () => {
  const criteria = new Or(new Static(5.2), new Static(1.6))
  const result = criteria.eval(Data.blank(), Result.of(5))
  expect(result.value).toBe(1)
})
