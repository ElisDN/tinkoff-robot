import { Data, Result } from '../robot/criteria'
import Price from './Price'

test('price', () => {
  const criteria = new Price()
  const result = criteria.eval(Data.blank().withPrice(3600), Result.of(5))
  expect(result.value).toBe(3600)
})
