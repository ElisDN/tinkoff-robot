import React, { useEffect, useState } from 'react'
import useAuth from '../../../auth/useAuth'
import api from '../../../api/api'

type Props = {
  accountId: string
  robotId: string
}

type Order = {
  id: string
  date: string
  figi: string
  buy: boolean
  lots: number
  price: number
}

function Orders({ accountId, robotId }: Props) {
  const { getToken } = useAuth()

  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState(null)

  const loadOrders = () => {
    setError(null)
    getToken()
      .then((token) => {
        api(`/api/accounts/${accountId}/robots/${robotId}/orders`, {
          headers: { Authorization: 'Bearer ' + token },
        })
          .then((data) => setOrders(data))
          .catch((error) => setError(error.message || error.statusText))
      })
      .catch(() => null)
  }

  useEffect(() => {
    loadOrders()
    const interval = setInterval(loadOrders, 9300)
    return () => clearInterval(interval)
  }, [])

  const formatPrice = (price: number) => {
    return price.toFixed(2)
  }

  return (
    <div className="card my-4">
      <div className="card-header">Активные заявки</div>
      {error ? <div className="alert alert-danger my-0">{error}</div> : null}
      {orders !== null ? (
        <table className="table table-striped align-middle my-0">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Тип</th>
              <th style={{ textAlign: 'right' }}>Лотов</th>
              <th style={{ textAlign: 'right' }}>Цена</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={'order-' + order.id}>
                <td>{order.date}</td>
                <td>{order.buy ? 'Покупка' : 'Продажа'}</td>
                <td style={{ textAlign: 'right' }}>{order.lots}</td>
                <td style={{ textAlign: 'right' }}>{formatPrice(order.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  )
}

export default Orders
