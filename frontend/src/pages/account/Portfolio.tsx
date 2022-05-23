import React, { useEffect, useState } from 'react'
import useAuth from '../../auth/useAuth'
import api from '../../api/api'
import PaySandboxAccountForm from './PaySandboxAccountForm'

type Props = {
  accountId: string
  accountReal: boolean
}

type Position = {
  type: string
  figi: string
  name: string
  ticker: string
  quantity: number | null
  currentPrice: number | null
  quantityLots: number | null
  currentCost: number | null
}

function Portfolio({ accountId, accountReal }: Props) {
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
    <div className="card my-4">
      <div className="card-header">Портфолио</div>
      {error ? <div className="alert alert-danger my-0">{error}</div> : null}
      {positions !== null ? (
        <table className="table table-striped align-middle my-0">
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
            <tr key={'position-currencies'}>
              <th colSpan={7} style={{ background: '#cae5f9' }}>
                Валюты
              </th>
            </tr>
          </thead>
          <tbody>
            {positions
              .filter((position) => position.type === 'currency')
              .map((position) => (
                <tr key={'position-' + position.figi}>
                  <td>{position.figi}</td>
                  <td>{position.ticker}</td>
                  <td>{position.name}</td>
                  <td style={{ textAlign: 'right' }}>{position.quantityLots}</td>
                  <td style={{ textAlign: 'right' }}>
                    {position.currentPrice ? formatPrice(position.currentPrice) : ''}
                  </td>
                  <td style={{ textAlign: 'right' }}>{position.quantity}</td>
                  <td style={{ textAlign: 'right' }}>
                    {position.currentCost ? formatPrice(position.currentCost) : ''}
                  </td>
                </tr>
              ))}
            {!accountReal ? (
              <tr key={'position-currencies'}>
                <th colSpan={7}>
                  <PaySandboxAccountForm accountId={accountId} onPay={loadPositions} />
                </th>
              </tr>
            ) : null}
          </tbody>
          <thead>
            <tr key={'position-instruments'}>
              <th colSpan={7} style={{ background: '#cae5f9' }}>
                Инструменты
              </th>
            </tr>
          </thead>
          <tbody>
            {positions
              .filter((position) => position.type !== 'currency')
              .map((position) => (
                <tr key={'position-' + position.figi}>
                  <td>{position.figi}</td>
                  <td>{position.ticker}</td>
                  <td>{position.name}</td>
                  <td style={{ textAlign: 'right' }}>{position.quantityLots}</td>
                  <td style={{ textAlign: 'right' }}>
                    {position.currentPrice ? formatPrice(position.currentPrice) : ''}
                  </td>
                  <td style={{ textAlign: 'right' }}>{position.quantity}</td>
                  <td style={{ textAlign: 'right' }}>
                    {position.currentCost ? formatPrice(position.currentCost) : ''}
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
