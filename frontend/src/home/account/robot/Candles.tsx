import React, { useEffect, useState } from 'react'
import useAuth from '../../../auth/useAuth'
import './Candles.css'

type Props = {
  accountId: string
  robotId: string
}

interface Quantity {
  units: number
  nano: number
}

interface Candle {
  open: Quantity
  high: Quantity
  low: Quantity
  close: Quantity
  volume: number
  time: string
}

function Candles({ accountId, robotId }: Props) {
  const { getToken } = useAuth()

  const [barWidth, setBarWidth] = useState<number>(2)
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

  const calcPrice = (price: Quantity) => {
    return price.units + price.nano / 1000000000
  }

  const formatPrice = (price: Quantity) => {
    return calcPrice(price).toFixed(2)
  }

  const min = candles ? Math.min(...candles.map((candle) => calcPrice(candle.low))) : 0
  const max = candles ? Math.max(...candles.map((candle) => calcPrice(candle.high))) : 0

  const height = 400
  const verticalScale = height / (max - min)

  return (
    <div className="card my-3">
      <div className="card-header">
        Цены
        <div className="btn-group float-end">
          <button type="button" className="btn btn-sm btn-outline-dark" onClick={() => setBarWidth(barWidth * 2)}>
            +
          </button>
          <button type="button" className="btn btn-sm btn-outline-dark" onClick={() => setBarWidth(barWidth / 2)}>
            &ndash;
          </button>
        </div>
      </div>
      {error ? <div className="alert alert-danger my-0">{error}</div> : null}
      {candles !== null ? (
        <div className="area">
          <svg width={candles.length * barWidth} height={height + 20}>
            {candles.map((candle, index) => {
              return (
                <g key={candle.time}>
                  <rect
                    className="bar"
                    x={index * barWidth + barWidth / 2 - 1}
                    width={2}
                    y={(max - calcPrice(candle.high)) * verticalScale + 20}
                    height={Math.abs(calcPrice(candle.high) - calcPrice(candle.low)) * verticalScale}
                  />
                  <rect
                    className={calcPrice(candle.open) <= calcPrice(candle.close) ? 'bar bar-up' : 'bar bar-down'}
                    x={index * barWidth}
                    width={barWidth}
                    y={(max - Math.max(calcPrice(candle.open), calcPrice(candle.close))) * verticalScale + 20}
                    height={Math.abs(calcPrice(candle.open) - calcPrice(candle.close)) * verticalScale}
                  />
                  <text x={index * barWidth} y="20">
                    {formatPrice(candle.close)}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      ) : null}
    </div>
  )
}

export default Candles
