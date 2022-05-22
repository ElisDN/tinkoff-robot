import { Data } from '../robot/criteria'
import NotFound from './NotFound'

test('not found', () => {
  const criteria = new NotFound()
  const result = criteria.eval()
  expect(result.value).toBe(0)
})
