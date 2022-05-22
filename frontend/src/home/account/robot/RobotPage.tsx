import React, { useEffect, useState } from 'react'
import useAuth from '../../../auth/useAuth'
import { Link, useParams } from 'react-router-dom'
import Chart from './Chart'
import StrategyEditor from './strategy/StrategyEditor'
import api from '../../../api/api'

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
    setError(null)
    getToken()
      .then((token) => {
        api(`/api/accounts/${accountId}`, {
          headers: { Authorization: 'Bearer ' + token },
        })
          .then((data) => {
            setAccount(data)

            api(`/api/accounts/${accountId}/robots/${robotId}`, {
              headers: { Authorization: 'Bearer ' + token },
            })
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
        <div className="card-header">Робот</div>
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
      <StrategyEditor accountId={accountId || ''} robotId={robotId || ''} />
      <Chart accountId={accountId || ''} robotId={robotId || ''} />
    </div>
  )
}

export default RobotPage
