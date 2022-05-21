import { Data, Result } from '../robot/criteria'
import Static from './Static'

test('static', () => {
  const criteria = new Static(32)
  const result = criteria.eval(Data.blank(), Result.of(5))
  expect(result.value).toBe(32)
})
