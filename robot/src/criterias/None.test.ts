import None from './None'

test('none', () => {
  const criteria = new None()
  const result = criteria.eval()
  expect(result.value).toBe(0)
})
