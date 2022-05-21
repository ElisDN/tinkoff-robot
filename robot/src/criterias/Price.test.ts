import { Data, Metric, Result } from '../robot/criteria'
import Price from './Price'

test('price', () => {
  const criteria = new Price('id-42')
  const result = criteria.eval(Data.blank().withPrice(3600), Result.blank())
  expect(result.value).toBe(3600)
  expect(result.metrics).toContainEqual<Metric>({ id: 'id-42', name: 'Цена', value: 3600 })
})
