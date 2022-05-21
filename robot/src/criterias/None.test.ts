import None from './None'
import { Data, Result } from '../robot/criteria'

test('none', () => {
  const criteria = new None()
  const result = criteria.eval(Data.blank(), Result.of(5))
  expect(result.value).toBe(0)
})
