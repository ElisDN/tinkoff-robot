import { Data, Result } from '../robot/criteria'
import NotFound from './NotFound'

test('not found', () => {
  const criteria = new NotFound()
  const result = criteria.eval(Data.blank(), Result.of(5))
  expect(result.value).toBe(0)
})
