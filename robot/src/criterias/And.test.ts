import Static from './Static'
import { Data, Result } from '../robot/criteria'
import And from './And'

test('and none', () => {
  const criteria = new And(new Static(0), new Static(0))
  const result = criteria.eval(Data.blank(), Result.of(5))
  expect(result.value).toBe(0)
})

test('and first', () => {
  const criteria = new And(new Static(4.06), new Static(0))
  const result = criteria.eval(Data.blank(), Result.of(5))
  expect(result.value).toBe(0)
})

test('and second', () => {
  const criteria = new And(new Static(0), new Static(3))
  const result = criteria.eval(Data.blank(), Result.of(5))
  expect(result.value).toBe(0)
})

test('and both', () => {
  const criteria = new And(new Static(5.2), new Static(1.6))
  const result = criteria.eval(Data.blank(), Result.of(5))
  expect(result.value).toBe(1)
})
