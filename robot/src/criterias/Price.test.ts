import PriceClose from './PriceClose'
import { Data } from '../robot/trading'

test('price', () => {
  const criteria = new PriceClose()
  const result = criteria.eval('id-42', Data.blank().withPrice(3600))
  expect(result.value).toBe(3600)
})
