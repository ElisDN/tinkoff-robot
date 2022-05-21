import Not from './Not'
import Static from './Static'
import { Data, Result } from '../robot/criteria'

test('not true', () => {
  const criteria = new Not(new Static(1))
  const result = criteria.eval(Data.blank(), Result.of(5))
  expect(result.value).toBe(0)
})

test('not false', () => {
  const criteria = new Not(new Static(0))
  const result = criteria.eval(Data.blank(), Result.of(5))
  expect(result.value).toBe(1)
})
