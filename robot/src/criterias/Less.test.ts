import Static from './Static'
import { Data, Result } from '../robot/criteria'
import Less from './Less'

test('less true', () => {
  const criteria = new Less(new Static(2.1), new Static(3.6))
  const result = criteria.eval(Data.blank(), Result.of(5))
  expect(result.value).toBe(1)
})

test('less false', () => {
  const criteria = new Less(new Static(14.06), new Static(6.12))
  const result = criteria.eval(Data.blank(), Result.of(5))
  expect(result.value).toBe(0)
})

test('less equal', () => {
  const criteria = new Less(new Static(4.02), new Static(4.02))
  const result = criteria.eval(Data.blank(), Result.of(5))
  expect(result.value).toBe(0)
})
