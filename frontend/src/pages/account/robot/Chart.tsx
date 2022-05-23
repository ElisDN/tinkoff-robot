import React, { useEffect, useState } from 'react'
import useAuth from '../../../auth/useAuth'
import './Chart.css'
import api from '../../../api/api'

type Props = {
  accountId: string
  robotId: string
}

interface Candle {
  time: string
  open: number
  high: number
  low: number
  close: number
}

function Chart({ accountId, robotId }: Props) {
  const { getToken } = useAuth()

  const [barWidth, setBarWidth] = useState<number>(1)
  const [candles, setCandles] = useState<Candle[] | null>(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    setError(null)
    getToken()
      .then((token) => {
        api(`/api/accounts/${accountId}/robots/${robotId}/chart`, {
          headers: { Authorization: 'Bearer ' + token },
        })
          .then((data) => setCandles(data))
          .catch((error) => setError(error.message || error.statusText))
      })
      .catch(() => null)
  }, [])

  const formatPrice = (price: number) => {
    return price.toFixed(2)
  }

  const min = candles ? Math.min(...candles.map((candle) => candle.low)) : 0
  const max = candles ? Math.max(...candles.map((candle) => candle.high)) : 0

  const height = 400
  const verticalScale = height / (max - min)

  return (
    <div className="card my-3">
      <div className="card-header">
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
              let candleClass = 'candle'
              if (candle.open < candle.close) {
                candleClass += ' candle-up'
              }
              if (candle.open > candle.close) {
                candleClass += ' candle-down'
              }
              return (
                <g key={candle.time} className="bar">
                  <rect x={index * barWidth} width={barWidth} y={0} height={height} />
                  <rect
                    className="candle"
                    x={index * barWidth + barWidth / 2 - barWidth / 20}
                    width={Math.max(barWidth / 10, 1)}
                    y={(max - candle.high) * verticalScale}
                    height={Math.abs(candle.high - candle.low) * verticalScale}
                  />
                  <rect
                    className={candleClass}
                    x={index * barWidth}
                    width={barWidth}
                    y={(max - Math.max(candle.open, candle.close)) * verticalScale}
                    height={Math.max(1, Math.abs(candle.open - candle.close) * verticalScale)}
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

export default Chart
