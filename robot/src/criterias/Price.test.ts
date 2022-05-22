import { Data, Metric } from '../robot/criteria'
import Price from './Price'

test('price', () => {
  const criteria = new Price()
  const result = criteria.eval('id-42', Data.blank().withPrice(3600))
  expect(result.value).toBe(3600)
  expect(result.metrics).toEqual<Metric[]>([{ id: 'id-42', name: 'Цена', value: 3600 }])
})
