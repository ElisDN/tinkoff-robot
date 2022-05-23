import React, { useEffect, useState } from 'react'
import useAuth from '../../../auth/useAuth'
import './Chart.css'
import api from '../../../api/api'

type Props = {
  accountId: string
  robotId: string
}

type Candle = {
  time: string
  open: number
  high: number
  low: number
  close: number
}

type Order = {
  buy: boolean
}

type Metric = {
  id: string
  name: string
  value: number | null
}

type Eval = {
  request: Order | null
  metrics: Metric[]
}

type Tick = {
  candle: Candle
  eval: Eval
}

function Chart({ accountId, robotId }: Props) {
  const { getToken } = useAuth()

  const [barWidth, setBarWidth] = useState<number>(2)
  const [ticks, setTicks] = useState<Tick[] | null>(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    setError(null)
    getToken()
      .then((token) => {
        api(`/api/accounts/${accountId}/robots/${robotId}/chart`, {
          headers: { Authorization: 'Bearer ' + token },
        })
          .then((data) => setTicks(data))
          .catch((error) => setError(error.message || error.statusText))
      })
      .catch(() => null)
  }, [])

  const formatPrice = (price: number) => {
    return price.toFixed(2)
  }

  const min = ticks ? Math.min(...ticks.map((tick) => tick.candle.low)) : 0
  const max = ticks ? Math.max(...ticks.map((tick) => tick.candle.high)) : 0

  const height = 500
  const verticalScale = height / (max - min)

  return (
    <div className="row">
      <div className="col-md-8 col-lg-10">
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
            Тест
          </div>
          {error ? <div className="alert alert-danger my-0">{error}</div> : null}
          <div className="area" style={{ height: height }}>
            {ticks !== null ? (
              <svg width={ticks.length * barWidth} height={height} style={{ display: 'block', margin: '0 auto' }}>
                {ticks.map((tick, index) => {
                  let candleClass = 'candle'
                  if (tick.candle.open < tick.candle.close) {
                    candleClass += ' candle-up'
                  }
                  if (tick.candle.open > tick.candle.close) {
                    candleClass += ' candle-down'
                  }
                  return (
                    <g key={tick.candle.time} className="bar">
                      <rect x={index * barWidth} width={barWidth} y={0} height={height} />
                      <rect
                        className="candle"
                        x={index * barWidth + barWidth / 2 - barWidth / 20}
                        width={Math.max(barWidth / 10, 1)}
                        y={(max - tick.candle.high) * verticalScale}
                        height={Math.abs(tick.candle.high - tick.candle.low) * verticalScale}
                      />
                      <rect
                        className={candleClass}
                        x={index * barWidth}
                        width={barWidth}
                        y={(max - Math.max(tick.candle.open, tick.candle.close)) * verticalScale}
                        height={Math.max(1, Math.abs(tick.candle.open - tick.candle.close) * verticalScale)}
                      />
                      {tick.eval.metrics.map((metric, i) => {
                        if (metric.value === null) {
                          return null
                        }
                        return (
                          <rect
                            key={'metric-' + i}
                            x={index * barWidth}
                            y={(max - metric.value) * verticalScale}
                            width={barWidth * 0.5}
                            height={2}
                            fill={'#000'}
                          />
                        )
                      })}
                      <title>
                        {new Date(tick.candle.time).toUTCString()}
                        {'\n\n'}
                        Открытие: {formatPrice(tick.candle.open)}
                        {'\n'}
                        Закрытие: {formatPrice(tick.candle.close)}
                        {'\n\n'}
                        Масимум: &nbsp;{formatPrice(tick.candle.high)}
                        {'\n'}
                        Минимум: &nbsp;{formatPrice(tick.candle.low)}
                        {'\n\n'}
                        {tick.eval.metrics.map((metric) => {
                          return (
                            <>
                              {metric.name}: &nbsp; {metric.value}
                              {'\n'}
                            </>
                          )
                        })}
                      </title>
                    </g>
                  )
                })}
                {ticks.map((tick, index) => (
                  <>
                    {tick.eval.request ? (
                      <g key={'order-' + index}>
                        <circle
                          cx={index * barWidth + barWidth / 2}
                          cy={(max - tick.candle.close) * verticalScale}
                          r={10}
                          style={{
                            fill: '#faff5d',
                            stroke: tick.eval.request.buy ? '#af27dc' : '#f35411',
                            strokeWidth: '4px',
                          }}
                        />
                        <title>
                          {tick.eval.request.buy ? 'Покупка' : 'Продажа'} {tick.candle.close}
                        </title>
                      </g>
                    ) : null}
                  </>
                ))}
              </svg>
            ) : null}
          </div>
        </div>
      </div>
      <div className="col-md-4 col-lg-2">
        <div className="card my-3">
          <div className="card-header">Итог</div>
          <table className="table my-0">
            <tbody>
              <tr>
                <th>Доход</th>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Chart
