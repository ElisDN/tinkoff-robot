import React, { useEffect, useState } from 'react'
import useAuth from '../../auth/useAuth'
import api from '../../api/api'

type Props = {
  accountId: string
  onCreate(): void
}

type Robot = {
  id: string
  figi: string
  accountName: string
  name: string
  instrument: string
}

type FormData = {
  figi: string
  name: string
  lots: string
  from: string
}

function CreateRobotForm({ accountId, onCreate }: Props) {
  const { getToken } = useAuth()

  const [robots, setRobots] = useState<Robot[] | null>(null)
  const [formData, setFormData] = useState<FormData>({ figi: '', name: '', lots: '', from: '' })
  const [error, setError] = useState(null)

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
        api('/api/robots', {
          headers: { Authorization: 'Bearer ' + token },
        }).then((data) => setRobots(data))
      })
      .catch((error) => setError(error.message || error.statusText))
  }

  useEffect(() => {
    loadRobots()
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
          setFormData({ figi: '', name: '', lots: '', from: '' })
          loadRobots()
          onCreate()
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

  return (
    <div>
      {error ? <div className="alert alert-danger my-0">{error}</div> : null}
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
            <input
              type="number"
              name="lots"
              value={formData.lots}
              onChange={handleChange}
              className="form-control"
              placeholder="Лотов"
              required
            />
          </div>
          <div className="col-auto">
            <select name="from" value={formData.from} onChange={handleChange} className="form-control">
              <option value="">Пустая стратегия</option>
              {robots
                ? robots.map((allRobot) => (
                    <option key={'allRobot-' + allRobot.id} value={allRobot.id}>
                      {allRobot.accountName}: {allRobot.name}
                    </option>
                  ))
                : null}
            </select>
          </div>
          <div className="col-auto">
            <button className="w-100 btn btn-primary" type="submit">
              Создать робота
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default CreateRobotForm
