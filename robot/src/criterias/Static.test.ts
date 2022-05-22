import { Metric } from '../robot/criteria'
import Static from './Static'

test('static', () => {
  const criteria = new Static(32, 'id-42')
  const result = criteria.eval()
  expect(result.value).toBe(32)
  expect(result.metrics).toEqual<Metric[]>([{ id: 'id-42', name: 'Значение', value: 32 }])
})
