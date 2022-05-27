import React, { useEffect, useState } from 'react'
import useAuth from '../../../auth/useAuth'
import { Link, useParams } from 'react-router-dom'
import BackTest from './BackTest'
import StrategyEditor from './strategy/StrategyEditor'
import api from '../../../api/api'
import Operations from './Operations'
import Orders from './Orders'
import EditRobotForm from './EditRobotForm'

type AccountResponse = {
  id: string
  name: string
  real: boolean
}

export type Robot = {
  figi: string
  lots: number
  name: string
  instrument: string
  active: boolean
}

function RobotPage() {
  const { accountId, robotId } = useParams()
  const { getToken } = useAuth()

  const [account, setAccount] = useState<AccountResponse | null>(null)
  const [robot, setRobot] = useState<Robot | null>(null)
  const [error, setError] = useState(null)
  const [chartKey, setChartKey] = useState(1)

  const loadRobot = () => {
    setError(null)
    getToken()
      .then((token) => {
        api(`/api/accounts/${accountId}/robots/${robotId}`, {
          headers: { Authorization: 'Bearer ' + token },
        }).then((data) => setRobot(data))
      })
      .catch((error) => setError(error.message || error.statusText))
  }

  useEffect(() => {
    setError(null)
    getToken()
      .then((token) => {
        api(`/api/accounts/${accountId}`, {
          headers: { Authorization: 'Bearer ' + token },
        }).then((data) => setAccount(data))
      })
      .catch((error) => setError(error.message || error.statusText))
    loadRobot()
  }, [])

  const startRobot = () => {
    setError(null)
    getToken()
      .then((token) => {
        api(`/api/accounts/${accountId}/robots/${robotId}/start`, {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + token },
        })
          .then(() => loadRobot())
          .catch((error) => setError(error.message || error.statusText))
      })
      .catch(() => null)
  }

  const stopRobot = () => {
    setError(null)
    getToken()
      .then((token) => {
        api(`/api/accounts/${accountId}/robots/${robotId}/stop`, {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + token },
        })
          .then(() => loadRobot())
          .catch((error) => setError(error.message || error.statusText))
      })
      .catch(() => null)
  }

  const buy = () => {
    setError(null)
    getToken()
      .then((token) => {
        api(`/api/accounts/${accountId}/robots/${robotId}/buy`, {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + token },
        })
          .then(() => loadRobot())
          .catch((error) => setError(error.message || error.statusText))
      })
      .catch(() => null)
  }

  const sell = () => {
    setError(null)
    getToken()
      .then((token) => {
        api(`/api/accounts/${accountId}/robots/${robotId}/sell`, {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + token },
        })
          .then(() => loadRobot())
          .catch((error) => setError(error.message || error.statusText))
      })
      .catch(() => null)
  }

  return (
    <div className="container-fluid py-3">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">Главная</Link>
          </li>
          {account !== null ? (
            <li className="breadcrumb-item">
              <Link to={'/' + account.id}>{account.name}</Link>
            </li>
          ) : null}
          {robot !== null ? <li className="breadcrumb-item active">{robot.name}</li> : null}
        </ol>
      </nav>
      <div className="card my-3">
        {robot !== null ? <div className="card-header">Робот для {robot.instrument}</div> : null}
        {error ? <div className="alert alert-danger my-0">{error}</div> : null}
        {robot !== null ? (
          <div className="card-footer">
            <EditRobotForm
              accountId={accountId || ''}
              robotId={robotId || ''}
              robot={robot}
              onEdit={() => window.location.reload()}
            />
          </div>
        ) : null}
      </div>
      <BackTest chartKey={chartKey} accountId={accountId || ''} robotId={robotId || ''} />
      <div className="row">
        <div className="col-md-8 col-lg-9">
          <StrategyEditor
            accountId={accountId || ''}
            robotId={robotId || ''}
            onChange={() => setChartKey(chartKey + 1)}
          />
        </div>
        <div className="col-md-4 col-lg-3">
          {robot !== null ? (
            <>
              {!robot.active ? (
                <div className="row my-3">
                  <div className="col-md-6 d-grid">
                    <button className="btn btn-outline-primary py-3" onClick={buy}>
                      Купить
                    </button>
                  </div>
                  <div className="col-md-6 d-grid">
                    <button className="btn btn-outline-primary py-3" onClick={sell}>
                      Продать
                    </button>
                  </div>
                </div>
              ) : null}
              <div className="my-3 d-grid">
                {robot.active ? (
                  <button className="btn btn-danger py-3" onClick={stopRobot}>
                    Остановить робота
                  </button>
                ) : (
                  <button className="btn btn-primary py-3" onClick={startRobot}>
                    Запустить робота
                  </button>
                )}
              </div>
            </>
          ) : null}
          <Orders accountId={accountId || ''} robotId={robotId || ''} />
          <Operations accountId={accountId || ''} robotId={robotId || ''} />
        </div>
      </div>
    </div>
  )
}

export default RobotPage
