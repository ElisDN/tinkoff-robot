import React, { useEffect, useState } from 'react'
import useAuth from '../../auth/useAuth'
import { Link } from 'react-router-dom'
import api from '../../api/api'
import CreateRobotForm from './CreateRobotForm'

type Props = {
  accountId: string
}

type Robot = {
  id: string
  figi: string
  name: string
  lots: number
  instrument: string
  active: boolean
  startDate: string | null
}

function Robots({ accountId }: Props) {
  const { getToken } = useAuth()

  const [robots, setRobots] = useState<Robot[] | null>(null)
  const [error, setError] = useState(null)

  const loadRobots = () => {
    setError(null)
    getToken()
      .then((token) => {
        api(`/api/accounts/${accountId}/robots`, {
          headers: { Authorization: 'Bearer ' + token },
        }).then((data) => setRobots(data))
      })
      .catch((error) => setError(error.message || error.statusText))
  }

  useEffect(() => {
    loadRobots()
    const interval = setInterval(loadRobots, 3000)
    return () => clearInterval(interval)
  }, [])

  const removeRobot = (robotId: string) => {
    if (!confirm('Удалить робота?')) {
      return
    }
    setError(null)
    getToken()
      .then((token) => {
        api(`/api/accounts/${accountId}/robots/${robotId}`, {
          method: 'DELETE',
          headers: { Authorization: 'Bearer ' + token },
        })
          .then(() => loadRobots())
          .catch((error) => setError(error.message || error.statusText))
      })
      .catch(() => null)
  }

  return (
    <div className="card my-3">
      <div className="card-header">Роботы</div>
      {error ? <div className="alert alert-danger my-0">{error}</div> : null}
      {robots !== null ? (
        <table className="table align-middle my-0">
          <tbody>
            {robots.map((robot) => (
              <tr key={'robot-' + robot.id}>
                <td>
                  <Link to={'/' + accountId + '/' + robot.id}>{robot.name}</Link>
                </td>
                <td>{robot.figi}</td>
                <td>{robot.instrument}</td>
                <td>{robot.lots}</td>
                <td style={{ textAlign: 'right' }}>
                  {robot.active ? 'Запущен' : ''} {robot.startDate}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => removeRobot(robot.id)}>
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      {robots !== null ? (
        <div className="card-footer">
          <CreateRobotForm
            key={'robots-' + robots.map((robot) => robot.id).join('-')}
            accountId={accountId}
            onCreate={loadRobots}
          />
        </div>
      ) : null}
    </div>
  )
}

export default Robots
