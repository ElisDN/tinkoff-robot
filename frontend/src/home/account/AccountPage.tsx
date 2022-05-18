import React, { useEffect, useState } from 'react'
import useAuth from '../../auth/useAuth'
import { Link, useParams } from 'react-router-dom'
import Portfolio from './Portfolio'

type AccountResponse = {
  real: boolean
  account: {
    id: string
    name: string
  }
}

function AccountPage() {
  const { accountId } = useParams()

  const { getToken } = useAuth()

  const [account, setAccount] = useState<AccountResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getToken()
      .then((token) => {
        fetch(process.env.REACT_APP_API_HOST + `/api/accounts/${accountId}`, {
          headers: { Authorization: 'Bearer ' + token },
        })
          .then((response) => response.json())
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
            <Link to="/">Home</Link>
          </li>
          {account !== null ? <li className="breadcrumb-item active">{account.account.name || 'Песочница'}</li> : null}
        </ol>
      </nav>
      {error ? <div className="alert alert-danger my-0">{error}</div> : null}
      {account !== null ? <Portfolio accountId={account.account.id} /> : null}
    </div>
  )
}

export default AccountPage
