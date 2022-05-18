import React, { useEffect, useState } from 'react'
import useAuth from './auth/useAuth'

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

  useEffect(() => {
    getToken()
      .then((token) => {
        fetch(process.env.REACT_APP_API_HOST + `/api/accounts/${accountId}/portfolio`, {
          headers: { Authorization: 'Bearer ' + token },
        })
          .then((response) => response.json())
          .then((data) => setPositions(data))
          .catch((error) => setError(error.message || error.statusText))
      })
      .catch(() => null)
  }, [])

  return (
    <div className="card">
      <div className="card-header">Positions</div>
      {error ? <div className="alert alert-danger my-0">{error}</div> : null}
      {positions !== null ? (
        <table className="table table-striped my-0">
          <thead>
            <tr>
              <th>FIGI</th>
              <th>Type</th>
              <th>Lots</th>
              <th>Quantity</th>
              <th>Current Price</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position) => (
              <tr key={'position-' + position.figi}>
                <td>{position.figi}</td>
                <td>{position.instrumentType}</td>
                <td>{position.quantityLots?.units}</td>
                <td>{position.quantity.units}</td>
                <td>{position.currentPrice ? position.currentPrice.units + '.' + position.currentPrice.nano : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  )
}

export default Portfolio
