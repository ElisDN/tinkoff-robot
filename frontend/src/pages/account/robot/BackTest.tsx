import React, { Fragment, useEffect, useState } from 'react'
import useAuth from '../../../auth/useAuth'
import './BackTest.css'
import api from '../../../api/api'

type Props = {
  accountId: string
  robotId: string
  chartKey: number
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

type Result = {
  ticks: Tick[]
  summary: {
    lots: number
    instrumentLots: number
    startCost: number
    endCost: number
    diffProfit: number
    ordersCount: number
    total: number
    comissions: number
    tradingPofit: number
    tradingEndPofit: number
  }
}

function BackTest({ accountId, robotId, chartKey }: Props) {
  const { getToken } = useAuth()

  const [barWidth, setBarWidth] = useState<number>(2)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    setResult(null)
    setError(null)
    getToken()
      .then((token) => {
        api(`/api/accounts/${accountId}/robots/${robotId}/back-test`, {
          headers: { Authorization: 'Bearer ' + token },
        })
          .then((data) => setResult(data))
          .catch((error) => setError(error.message || error.statusText))
      })
      .catch(() => null)
  }, [chartKey])

  const formatPrice = (price: number) => {
    return price.toFixed(2)
  }

  const min = result ? Math.min(...result.ticks.map((tick) => tick.candle.low)) : 0
  const max = result ? Math.max(...result.ticks.map((tick) => tick.candle.high)) : 0

  const height = 500
  const verticalScale = height / (max - min)

  return (
    <div className="row">
      <div className="col-md-8 col-lg-9">
        <div className="card my-3">
          <div className="card-header">
            <div className="btn-group float-end" style={{ margin: '-0.25rem 0' }}>
              <button type="button" className="btn btn-sm btn-outline-dark" onClick={() => setBarWidth(barWidth * 2)}>
                +
              </button>
              <button type="button" className="btn btn-sm btn-outline-dark" onClick={() => setBarWidth(barWidth / 2)}>
                &ndash;
              </button>
            </div>
            Тест на истории
          </div>
          {error ? <div className="alert alert-danger my-0">{error}</div> : null}
          <div className="area" style={{ height: height + 20 }}>
            {result !== null ? (
              <svg
                width={result.ticks.length * barWidth}
                height={height}
                style={{ display: 'block', margin: '0 auto' }}
              >
                {result.ticks.map((tick, index) => {
                  let candleClass = 'candle'
                  if (tick.candle.open < tick.candle.close) {
                    candleClass += ' candle-up'
                  }
                  if (tick.candle.open > tick.candle.close) {
                    candleClass += ' candle-down'
                  }
                  return (
                    <Fragment key={'tik-metric-' + tick.candle.time}>
                      <g key={'bar-' + tick.candle.time} className="bar">
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
                        <title>
                          {new Date(tick.candle.time).toUTCString()}
                          {'\n\n'}
                          Открытие: {formatPrice(tick.candle.open)}
                          {'\n'}
                          Закрытие: {formatPrice(tick.candle.close)}
                          {'\n\n'}
                          Максимум: &nbsp;{formatPrice(tick.candle.high)}
                          {'\n'}
                          Минимум: &nbsp;{formatPrice(tick.candle.low)}
                          {'\n\n'}
                          {tick.eval.metrics.map((metric) => {
                            return (
                              <Fragment key={'bar-' + tick.candle.time + '-metrics-' + metric.id}>
                                {metric.name}: &nbsp; {metric.value !== null ? formatPrice(metric.value) : null}
                                {'\n'}
                              </Fragment>
                            )
                          })}
                        </title>
                      </g>
                      {tick.eval.metrics.map((metric) => {
                        if (metric.value === null) {
                          return null
                        }
                        return (
                          <g key={'tik-metric-' + tick.candle.time + '-' + metric.id}>
                            <rect
                              x={index * barWidth}
                              y={(max - metric.value) * verticalScale}
                              width={barWidth}
                              height={2}
                              fill={'#fff'}
                            />
                            <rect
                              x={index * barWidth}
                              y={(max - metric.value) * verticalScale}
                              width={barWidth * 0.5}
                              height={2}
                              fill={'#000'}
                            />
                            <title>
                              {metric.name}: &nbsp; {formatPrice(metric.value)}
                            </title>
                          </g>
                        )
                      })}
                    </Fragment>
                  )
                })}
                {result.ticks.map((tick, index) => {
                  return tick.eval.request ? (
                    <g key={'tik-order-' + tick.candle.time}>
                      <circle
                        cx={index * barWidth + barWidth}
                        cy={(max - tick.candle.close) * verticalScale}
                        r={8}
                        style={{
                          fill: '#faff5d',
                          fillOpacity: 0.8,
                          stroke: tick.eval.request.buy ? '#c60eef' : '#f35411',
                          strokeWidth: '4px',
                        }}
                      />
                      <title>
                        {tick.eval.request.buy ? 'Покупка' : 'Продажа'} {formatPrice(tick.candle.close)}
                      </title>
                    </g>
                  ) : null
                })}
              </svg>
            ) : null}
          </div>
        </div>
      </div>
      <div className="col-md-4 col-lg-3">
        <div className="card my-3">
          <div className="card-header">Тестовый результат</div>
          {result !== null ? (
            <table className="table my-0">
              <tbody>
                <tr>
                  <th>Лоты</th>
                  <td>
                    {result.summary.lots} x {result.summary.instrumentLots}{' '}
                  </td>
                </tr>
                <tr>
                  <th>Начальная стоимость</th>
                  <td>{formatPrice(result.summary.startCost)}</td>
                </tr>
                <tr>
                  <th>Конечная стоимость</th>
                  <td>{formatPrice(result.summary.endCost)}</td>
                </tr>
                <tr>
                  <th>Изменение стоимости</th>
                  <td>{formatPrice(result.summary.diffProfit)}</td>
                </tr>
                <tr>
                  <th>Сделок</th>
                  <td>{result.summary.ordersCount}</td>
                </tr>
                <tr>
                  <th>Оборот</th>
                  <td>{formatPrice(result.summary.total)}</td>
                </tr>
                <tr>
                  <th>Комиссия</th>
                  <td>{formatPrice(result.summary.comissions)}</td>
                </tr>
                <tr>
                  <th>Торговый доход</th>
                  <td>{formatPrice(result.summary.tradingPofit)}</td>
                </tr>
                {result.summary.tradingEndPofit !== result.summary.tradingPofit ? (
                  <tr>
                    <th>Доход если продать</th>
                    <td>{formatPrice(result.summary.tradingEndPofit)}</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default BackTest
