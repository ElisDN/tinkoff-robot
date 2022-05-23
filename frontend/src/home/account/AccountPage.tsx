import React, { useEffect, useState } from 'react'
import useAuth from '../../auth/useAuth'
import { Link, useParams } from 'react-router-dom'
import Portfolio from './Portfolio'
import Robots from './Robots'
import api from '../../api/api'

type AccountResponse = {
  id: string
  name: string
  real: boolean
}

function AccountPage() {
  const { accountId } = useParams()

  const { getToken } = useAuth()

  const [account, setAccount] = useState<AccountResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setError(null)
    getToken()
      .then((token) => {
        api(`/api/accounts/${accountId}`, {
          headers: { Authorization: 'Bearer ' + token },
        })
          .then((data) => setAccount(data))
          .catch((error) => setError(error.message || error.statusText))
      })
      .catch(() => null)
  }, [accountId])

  return (
    <div className="container py-3">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">Главная</Link>
          </li>
          {account !== null ? <li className="breadcrumb-item active">{account.name}</li> : null}
        </ol>
      </nav>
      {error ? <div className="alert alert-danger">{error}</div> : null}
      {account !== null ? <Robots accountId={account.id} /> : null}
      {account !== null ? <Portfolio accountId={account.id} accountReal={account.real} /> : null}
    </div>
  )
}

export default AccountPage
