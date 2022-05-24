import React, { useEffect, useState } from 'react'
import { Robot } from './RobotPage'
import useAuth from '../../../auth/useAuth'
import api from '../../../api/api'

type Props = {
  accountId: string
  robotId: string
  robot: Robot
  onEdit(): void
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
  lots: string
  from: string
}

function EditRobotForm({ accountId, robotId, robot, onEdit }: Props) {
  const { getToken } = useAuth()

  const [robots, setRobots] = useState<AllRobot[] | null>(null)
  const [formData, setFormData] = useState<FormData>({
    figi: robot.figi,
    name: robot.name,
    lots: robot.lots.toString(),
    from: '',
  })
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
      api(`/api/accounts/${accountId}/robots/${robotId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify(formData),
      })
        .then(() => {
          setFormData({ ...formData, from: '' })
          loadRobots()
          onEdit()
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
              <option value="">Импорт стратегии</option>
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
            <button className="w-100 btn btn-outline-secondary" type="submit">
              Сохранить
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default EditRobotForm
