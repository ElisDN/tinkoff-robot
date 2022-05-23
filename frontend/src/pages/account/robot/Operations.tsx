import React, { useEffect, useState } from 'react'
import useAuth from '../../../auth/useAuth'
import api from '../../../api/api'

type Props = {
  accountId: string
  robotId: string
}

type Operation = {
  id: string
  date: string
  figi: string
  buy: boolean
  lots: number
  price: number
}

function Operations({ accountId, robotId }: Props) {
  const { getToken } = useAuth()

  const [operations, setOperations] = useState<Operation[] | null>(null)
  const [error, setError] = useState(null)

  const loadOperations = () => {
    setError(null)
    getToken()
      .then((token) => {
        api(`/api/accounts/${accountId}/robots/${robotId}/operations`, {
          headers: { Authorization: 'Bearer ' + token },
        })
          .then((data) => setOperations(data))
          .catch((error) => setError(error.message || error.statusText))
      })
      .catch(() => null)
  }

  useEffect(() => {
    loadOperations()
    const interval = setInterval(loadOperations, 10000)
    return () => clearInterval(interval)
  }, [])

  const formatPrice = (price: number) => {
    return price.toFixed(2)
  }

  return (
    <div className="card my-4">
      <div className="card-header">Последние операции</div>
      {error ? <div className="alert alert-danger my-0">{error}</div> : null}
      {operations !== null ? (
        <table className="table table-striped align-middle my-0">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Тип</th>
              <th style={{ textAlign: 'right' }}>Лотов</th>
              <th style={{ textAlign: 'right' }}>Цена</th>
            </tr>
          </thead>
          <tbody>
            {operations.map((operation) => (
              <tr key={'operation-' + operation.id}>
                <td>{operation.date}</td>
                <td>{operation.buy ? 'Покупка' : 'Продажа'}</td>
                <td style={{ textAlign: 'right' }}>{operation.lots}</td>
                <td style={{ textAlign: 'right' }}>{formatPrice(operation.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  )
}

export default Operations
