import React, { useEffect, useState } from 'react'
import useAuth from '../../auth/useAuth'
import { Link } from 'react-router-dom'

type Props = {
  accountId: string
}

type Robot = {
  id: string
  figi: string
}

type FormData = {
  figi: string
}

function Robots({ accountId }: Props) {
  const { getToken } = useAuth()

  const [robots, setRobots] = useState<Robot[] | null>(null)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState<FormData>({ figi: '' })

  const handleChange = (event: React.FormEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.currentTarget.name]: event.currentTarget.value,
    })
  }

  const loadRobots = () => {
    getToken()
      .then((token) => {
        fetch(process.env.REACT_APP_API_HOST + `/api/accounts/${accountId}/robots`, {
          headers: { Authorization: 'Bearer ' + token },
        })
          .then((response) => response.json())
          .then((data) => setRobots(data))
          .catch((error) => setError(error.message || error.statusText))
      })
      .catch(() => null)
  }

  useEffect(() => {
    loadRobots()
    const interval = setInterval(loadRobots, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault()
    getToken().then((token) => {
      fetch(process.env.REACT_APP_API_HOST + `/api/accounts/${accountId}/robots/create`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify(formData),
      })
        .then((response) => {
          if (response.ok) {
            return response
          }
          throw response
        })
        .then(() => {
          setFormData({ figi: '' })
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

  return (
    <div className="card my-3">
      <div className="card-header">Robots</div>
      {error ? <div className="alert alert-danger my-0">{error}</div> : null}
      {robots !== null ? (
        <table className="table my-0">
          <tbody>
            {robots.map((robot) => (
              <tr key={'robot-' + robot.figi}>
                <td>
                  <Link to={'/' + accountId + '/' + robot.id}>{robot.figi}</Link>
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
                  type="figi"
                  name="figi"
                  value={formData.figi}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="FIGI"
                />
              </div>
              <div className="col-auto">
                <button className="w-100 btn btn-primary" type="submit">
                  Add
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
