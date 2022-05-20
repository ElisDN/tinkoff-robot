import React, { useEffect, useState } from 'react'
import useAuth from '../auth/useAuth'
import { Link } from 'react-router-dom'
import api from '../api/api'

type Account = {
  real: boolean
  account: {
    id: string
    name: string | null
  }
}

function Accounts() {
  const { getToken } = useAuth()

  const [accounts, setAccounts] = useState<Account[] | null>(null)
  const [error, setError] = useState(null)

  const loadAccounts = () => {
    getToken()
      .then((token) => {
        api('/api/accounts', {
          headers: { Authorization: 'Bearer ' + token },
        })
          .then((data) => setAccounts(data))
          .catch((error) => setError(error.message || error.statusText))
      })
      .catch(() => null)
  }

  useEffect(() => {
    if (accounts === null) {
      loadAccounts()
    }
  }, [])

  const openSandboxAccount = () => {
    setError(null)
    getToken()
      .then((token) => {
        api('/api/sandbox/accounts', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + token },
        })
          .then(() => loadAccounts())
          .catch((error) => setError(error.message || error.statusText))
      })
      .catch(() => null)
  }

  const closeSandboxAccount = (accountId: string) => {
    setError(null)
    getToken()
      .then((token) => {
        api(`/api/sandbox/accounts/${accountId}`, {
          method: 'DELETE',
          headers: { Authorization: 'Bearer ' + token },
        })
          .then(() => loadAccounts())
          .catch((error) => setError(error.message || error.statusText))
      })
      .catch(() => null)
  }

  return (
    <div className="card">
      <div className="card-header">Счета</div>
      {error ? <div className="alert alert-danger my-0">{error}</div> : null}
      {accounts !== null ? (
        <table className="table my-0">
          <tbody>
            {accounts.map((account) => (
              <tr key={'account-' + account.account.id}>
                <td>
                  <Link to={'/' + account.account.id}>{account.account.name || 'Песочница'}</Link>
                </td>
                <td style={{ textAlign: 'right' }}>
                  {!account.real ? (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => closeSandboxAccount(account.account.id)}
                    >
                      Удалить
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      {accounts !== null ? (
        <div className="card-footer">
          <button type="button" className="btn btn-primary btn-sm" onClick={openSandboxAccount}>
            Создать песочницу
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default Accounts
