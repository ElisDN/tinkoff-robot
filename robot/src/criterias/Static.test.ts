import Static from './Static'
import { Param, Params } from '../robot/node'
import { Data, Metric } from '../robot/trading'

test('static', () => {
  const criteria = new Static()
  const result = criteria.eval('id-42', Data.blank(), new Params([new Param('value', 32)]))
  expect(result.value).toBe(32)
  expect(result.metrics).toEqual<Metric[]>([{ id: 'id-42', name: 'Значение', value: 32 }])
})
