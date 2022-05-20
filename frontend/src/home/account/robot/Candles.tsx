import React, { useEffect, useState } from 'react'
import useAuth from '../../../auth/useAuth'
import './Candles.css'
import api from '../../../api/api'

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
        api(`/api/accounts/${accountId}/robots/${robotId}/candles`, {
          headers: { Authorization: 'Bearer ' + token },
        })
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
          <svg width={candles.length * barWidth} height={height}>
            {candles.map((candle, index) => {
              return (
                <g key={candle.time} className="bar">
                  <rect x={index * barWidth} width={barWidth} y={0} height={height} />
                  <rect
                    className="candle"
                    x={index * barWidth + barWidth / 2 - barWidth / 20}
                    width={Math.max(barWidth / 10, 1)}
                    y={(max - calcPrice(candle.high)) * verticalScale}
                    height={Math.abs(calcPrice(candle.high) - calcPrice(candle.low)) * verticalScale}
                  />
                  <rect
                    className={
                      calcPrice(candle.open) <= calcPrice(candle.close) ? 'candle candle-up' : 'candle candle-down'
                    }
                    x={index * barWidth}
                    width={barWidth}
                    y={(max - Math.max(calcPrice(candle.open), calcPrice(candle.close))) * verticalScale}
                    height={Math.abs(calcPrice(candle.open) - calcPrice(candle.close)) * verticalScale}
                  />
                  <title>
                    {new Date(candle.time).toUTCString()}
                    {'\n\n'}
                    Открытие: {formatPrice(candle.open)}
                    {'\n'}
                    Закрытие: {formatPrice(candle.close)}
                    {'\n\n'}
                    Масимум: &nbsp;{formatPrice(candle.high)}
                    {'\n'}
                    Минимум: &nbsp;{formatPrice(candle.low)}
                  </title>
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
