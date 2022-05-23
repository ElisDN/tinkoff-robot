import React, { useEffect, useState } from 'react'
import useAuth from '../../auth/useAuth'
import api from '../../api/api'

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

type FormData = {
  amount: string
  currency: string
}

function Portfolio({ accountId, accountReal }: Props) {
  const { getToken } = useAuth()

  const [payFormData, setPayFormData] = useState<FormData>({ amount: '', currency: '' })
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

  const payHandleChange = (event: React.FormEvent<HTMLInputElement>) => {
    setPayFormData({
      ...payFormData,
      [event.currentTarget.name]: event.currentTarget.value,
    })
  }

  const payHandleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault()
    setError(null)
    getToken().then((token) => {
      api(`/api/accounts/${accountId}/portfolio/sandbox-pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify(payFormData),
      })
        .then(() => {
          setPayFormData({ amount: '', currency: '' })
          loadPositions()
        })
        .catch(async (error) => {
          if (error instanceof Response) {
            const data = await error.json()
            setError(data.message)
            return
          }
          setError(error.message)
        })
    })
  }

  const formatPrice = (price: number) => {
    return price.toFixed(2)
  }

  return (
    <div className="card my-3">
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
                  <form method="post" onSubmit={payHandleSubmit}>
                    <div className="row">
                      <div className="col-auto">
                        <input
                          type="number"
                          name="amount"
                          value={payFormData.amount}
                          onChange={payHandleChange}
                          className="form-control"
                          placeholder="Сумма"
                          required
                        />
                      </div>
                      <div className="col-auto">
                        <input
                          type="text"
                          name="currency"
                          value={payFormData.currency}
                          onChange={payHandleChange}
                          className="form-control"
                          placeholder="Валюта"
                          required
                        />
                      </div>
                      <div className="col-auto">
                        <button className="w-100 btn btn-primary" type="submit">
                          Пополнить
                        </button>
                      </div>
                    </div>
                  </form>
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
