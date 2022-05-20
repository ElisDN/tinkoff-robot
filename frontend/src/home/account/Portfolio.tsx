import React, { useEffect, useState } from 'react'
import useAuth from '../../auth/useAuth'
import api from '../../api/api'

type Props = {
  accountId: string
}

interface Quantity {
  units: number
  nano: number
}

interface Position {
  figi: string
  instrumentType: string
  quantity: Quantity
  currentPrice: Quantity
  quantityLots: Quantity
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

  const formatPrice = (price: Quantity) => {
    return (price.units + price.nano / 1000000000).toFixed(2)
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
              <th>Тип</th>
              <th>Лотов</th>
              <th>Единиц</th>
              <th style={{ textAlign: 'right' }}>Цена</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position) => (
              <tr key={'position-' + position.figi}>
                <td>{position.figi}</td>
                <td>{position.instrumentType}</td>
                <td>{position.quantityLots?.units}</td>
                <td>{position.quantity.units}</td>
                <td style={{ textAlign: 'right' }}>
                  {position.currentPrice ? formatPrice(position.currentPrice) : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  )
}

export default Portfolio
