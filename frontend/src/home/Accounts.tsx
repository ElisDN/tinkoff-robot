import React, { useEffect, useState } from 'react'
import useAuth from '../auth/useAuth'
import { Link } from 'react-router-dom'

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
        fetch(process.env.REACT_APP_API_HOST + '/api/accounts', {
          headers: { Authorization: 'Bearer ' + token },
        })
          .then((response) => response.json())
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
        fetch(process.env.REACT_APP_API_HOST + '/api/sandbox/accounts', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + token },
        })
          .then((response) => {
            if (response.ok) {
              return response
            }
            throw response
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
        fetch(process.env.REACT_APP_API_HOST + `/api/sandbox/accounts/${accountId}`, {
          method: 'DELETE',
          headers: { Authorization: 'Bearer ' + token },
        })
          .then((response) => {
            if (response.ok) {
              return response
            }
            throw response
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
                      Закрыть
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
