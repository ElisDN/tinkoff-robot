import React, { useState } from 'react'
import useAuth from '../../auth/useAuth'
import api from '../../api/api'

type Props = {
  accountId: string
  onPay(): void
}

type FormData = {
  amount: string
  currency: string
}

function PaySandboxAccountForm({ accountId, onPay }: Props) {
  const { getToken } = useAuth()

  const [formData, setFormData] = useState<FormData>({ amount: '', currency: '' })
  const [error, setError] = useState(null)

  const payHandleChange = (event: React.FormEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
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
        body: JSON.stringify(formData),
      })
        .then(() => {
          setFormData({ amount: '', currency: '' })
          onPay()
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

  return (
    <div>
      {error ? <div className="alert alert-danger my-0">{error}</div> : null}
      <form method="post" onSubmit={payHandleSubmit}>
        <div className="row">
          <div className="col-auto">
            <input
              type="number"
              name="amount"
              value={formData.amount}
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
              value={formData.currency}
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
    </div>
  )
}

export default PaySandboxAccountForm
