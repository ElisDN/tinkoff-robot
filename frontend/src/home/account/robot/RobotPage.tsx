import React, { useEffect, useState } from 'react'
import useAuth from '../../../auth/useAuth'
import { Link, useParams } from 'react-router-dom'

type AccountResponse = {
  real: boolean
  account: {
    id: string
    name: string
  }
}

type Robot = {
  figi: string
}

function RobotPage() {
  const { accountId, robotId } = useParams()
  const { getToken } = useAuth()

  const [account, setAccount] = useState<AccountResponse | null>(null)
  const [robot, setRobot] = useState<Robot | null>(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getToken()
      .then((token) => {
        fetch(process.env.REACT_APP_API_HOST + `/api/accounts/${accountId}`, {
          headers: { Authorization: 'Bearer ' + token },
        })
          .then((response) => response.json())
          .then((data) => {
            setAccount(data)

            fetch(process.env.REACT_APP_API_HOST + `/api/accounts/${accountId}/robots/${robotId}`, {
              headers: { Authorization: 'Bearer ' + token },
            })
              .then((response) => response.json())
              .then((data) => setRobot(data))
              .catch((error) => setError(error.message || error.statusText))
          })
          .catch((error) => setError(error.message || error.statusText))
      })
      .catch(() => null)
  }, [])

  return (
    <div className="container py-3">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">Главная</Link>
          </li>
          {account !== null ? (
            <li className="breadcrumb-item">
              <Link to={'/' + account.account.id}>{account.account.name || 'Песочница'}</Link>
            </li>
          ) : null}
          {robot !== null ? <li className="breadcrumb-item active">{robot.figi}</li> : null}
        </ol>
      </nav>
      <div className="card my-3">
        <div className="card-header">Robot</div>
        {error ? <div className="alert alert-danger my-0">{error}</div> : null}
        {robot !== null ? (
          <table className="table my-0">
            <tbody>
              <tr key={'robot-' + robot.figi}>
                <td>{robot.figi}</td>
              </tr>
            </tbody>
          </table>
        ) : null}
      </div>
    </div>
  )
}

export default RobotPage
