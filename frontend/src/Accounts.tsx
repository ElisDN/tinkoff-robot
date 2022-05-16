import React, { useEffect, useState } from 'react'
import useAuth from './auth/useAuth'

type Account = {
  id: string
  name: string
}

function Accounts() {
  const { getToken } = useAuth()

  const [accounts, setAccounts] = useState<Account[] | null>(null)
  const [error, setError] = useState(null)

  useEffect(() => {
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
  }, [])

  return (
    <div className="card">
      <div className="card-header">Accounts</div>
      {error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : null}
      {accounts !== null ? (
        <table className="table my-0">
          <tbody>
            {accounts.map((account) => (
              <tr key={'account-' + account.id}>
                <td>{account.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  )
}

export default Accounts
