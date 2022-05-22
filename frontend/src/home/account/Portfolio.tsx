import React, { useEffect, useState } from 'react'
import useAuth from '../../auth/useAuth'
import api from '../../api/api'

type Props = {
  accountId: string
}

type Position = {
  figi: string
  name: string
  ticker: string
  quantity: number | null
  currentPrice: number | null
  quantityLots: number | null
  currentCost: number | null
}

function Portfolio({ accountId }: Props) {
  const { getToken } = useAuth()

  const [positions, setPositions] = useState<Position[] | null>(null)
  const [error, setError] = useState(null)

  const loadPositions = () => {
    setError(null)
    getToken()
      .then((token) => {
        api(`/api/accounts/${accountId}/portfolio`, {
          headers: { Authorization: 'Bearer ' + token },
        })
          .then((data) => setPositions(data))
          .catch((error) => setError(error.message || error.statusText))
      })
      .catch(() => null)
  }

  useEffect(() => {
    loadPositions()
    const interval = setInterval(loadPositions, 3000)
    return () => clearInterval(interval)
  }, [])

  const formatPrice = (price: number) => {
    return price.toFixed(2)
  }

  return (
    <div className="card my-3">
      <div className="card-header">Портфолио</div>
      {error ? <div className="alert alert-danger my-0">{error}</div> : null}
      {positions !== null ? (
        <table className="table table-striped my-0">
          <thead>
            <tr>
              <th>FIGI</th>
              <th>Тикер</th>
              <th>Имя</th>
              <th style={{ textAlign: 'right' }}>Лотов</th>
              <th style={{ textAlign: 'right' }}>Цена</th>
              <th style={{ textAlign: 'right' }}>Единиц</th>
              <th style={{ textAlign: 'right' }}>Стоимость</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position) => (
              <tr key={'position-' + position.figi}>
                <td>{position.figi}</td>
                <td>{position.ticker}</td>
                <td>{position.name}</td>
                <td style={{ textAlign: 'right' }}>{position.quantityLots}</td>
                <td style={{ textAlign: 'right' }}>
                  {position.currentPrice ? formatPrice(position.currentPrice) : ''}
                </td>
                <td style={{ textAlign: 'right' }}>{position.quantity}</td>
                <td style={{ textAlign: 'right' }}>{position.currentCost ? formatPrice(position.currentCost) : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  )
}

export default Portfolio
