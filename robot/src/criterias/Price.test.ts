import Price from './Price'
import { Data, Metric } from '../robot/trading'

test('price', () => {
  const criteria = new Price()
  const result = criteria.eval('id-42', Data.blank().withPrice(3600))
  expect(result.value).toBe(3600)
})
