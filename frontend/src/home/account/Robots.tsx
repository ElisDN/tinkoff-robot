import React, { useEffect, useState } from 'react'
import useAuth from '../../auth/useAuth'
import { Link } from 'react-router-dom'
import api from '../../api/api'

type Props = {
  accountId: string
}

type Robot = {
  id: string
  figi: string
  name: string
  instrument: string
}

type AllRobot = {
  id: string
  figi: string
  accountName: string
  name: string
  instrument: string
}

type FormData = {
  figi: string
  name: string
  from: string
}

function Robots({ accountId }: Props) {
  const { getToken } = useAuth()

  const [robots, setRobots] = useState<Robot[] | null>(null)
  const [allRobots, setAllRobots] = useState<AllRobot[] | null>(null)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState<FormData>({ figi: '', name: '', from: '' })

  const handleChange = (event: React.FormEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [event.currentTarget.name]: event.currentTarget.value,
    })
  }

  const loadRobots = () => {
    setError(null)
    getToken()
      .then((token) => {
        api(`/api/accounts/${accountId}/robots`, {
          headers: { Authorization: 'Bearer ' + token },
        }).then((data) => setRobots(data))
        api(`/api/robots`, {
          headers: { Authorization: 'Bearer ' + token },
        }).then((data) => setAllRobots(data))
      })
      .catch((error) => setError(error.message || error.statusText))
  }

  useEffect(() => {
    loadRobots()
    const interval = setInterval(loadRobots, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault()
    setError(null)
    getToken().then((token) => {
      api(`/api/accounts/${accountId}/robots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify(formData),
      })
        .then(() => {
          setFormData({ figi: '', name: '', from: '' })
          loadRobots()
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

  const removeRobot = (robotId: string) => {
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
          <form method="post" onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-auto">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Название"
                  required
                />
              </div>
              <div className="col-auto">
                <input
                  type="text"
                  name="figi"
                  value={formData.figi}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="FIGI"
                  required
                />
              </div>
              <div className="col-auto">
                <select name="from" value={formData.from} onChange={handleChange} className="form-control">
                  <option value="">Новая стратегия</option>
                  {allRobots
                    ? allRobots.map((allRobot) => (
                        <option key={'allRobot-' + allRobot.id} value={allRobot.id}>
                          {allRobot.accountName}: {allRobot.name}
                        </option>
                      ))
                    : null}
                </select>
              </div>
              <div className="col-auto">
                <button className="w-100 btn btn-primary" type="submit">
                  Создать
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}

export default Robots
