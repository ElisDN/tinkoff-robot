import React, { useEffect, useState } from 'react'
import useAuth from '../../../auth/useAuth'

type Props = {
  accountId: string
  robotId: string
}

interface Quantity {
  units: number
  nano: number
}

interface Candle {
  open: Quantity | undefined
  high: Quantity | undefined
  low: Quantity | undefined
  close: Quantity | undefined
  volume: number
  time: string | undefined
}

function Candles({ accountId, robotId }: Props) {
  const { getToken } = useAuth()

  const [candles, setCandles] = useState<Candle[] | null>(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getToken()
      .then((token) => {
        fetch(process.env.REACT_APP_API_HOST + `/api/accounts/${accountId}/robots/${robotId}/candles`, {
          headers: { Authorization: 'Bearer ' + token },
        })
          .then((response) => response.json())
          .then((data) => setCandles(data))
          .catch((error) => setError(error.message || error.statusText))
      })
      .catch(() => null)
  }, [])

  const formatPrice = (price: Quantity) => {
    return (price.units + price.nano / 1000000000).toFixed(2)
  }

  return (
    <div className="card my-3">
      <div className="card-header">Цены</div>
      {error ? <div className="alert alert-danger my-0">{error}</div> : null}
      {candles !== null ? (
        <table className="table table-striped my-0">
          <thead>
            <tr>
              <th>Время</th>
              <th style={{ textAlign: 'right' }}>Открытие</th>
              <th style={{ textAlign: 'right' }}>Мин</th>
              <th style={{ textAlign: 'right' }}>Макс</th>
              <th style={{ textAlign: 'right' }}>Закрытие</th>
              <th style={{ textAlign: 'right' }}>Объём</th>
            </tr>
          </thead>
          <tbody>
            {candles.map((candle) => (
              <tr key={'candle-' + candle.time}>
                <td>{candle.time}</td>
                <td style={{ textAlign: 'right' }}>{candle.open ? formatPrice(candle.open) : ''}</td>
                <td style={{ textAlign: 'right' }}>{candle.low ? formatPrice(candle.low) : ''}</td>
                <td style={{ textAlign: 'right' }}>{candle.high ? formatPrice(candle.high) : ''}</td>
                <td style={{ textAlign: 'right' }}>{candle.close ? formatPrice(candle.close) : ''}</td>
                <td style={{ textAlign: 'right' }}>{candle.volume}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  )
}

export default Candles
