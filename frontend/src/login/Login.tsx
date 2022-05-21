import React, { useState } from 'react'
import useAuth from '../auth/useAuth'
import './Login.css'
import api from '../api/api'

type FormData = {
  password: string
}

function Login() {
  const { login } = useAuth()

  const [formData, setFormData] = useState<FormData>({ password: '' })
  const [error, setError] = useState<string | null>(null)

  const handleChange = (event: React.FormEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.currentTarget.name]: event.currentTarget.value,
    })
  }

  interface SuccessResponse {
    token: string
    expires: number
  }

  const handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault()
    setError(null)
    api('/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then((data: SuccessResponse) => {
        login(data.token, data.expires)
      })
      .catch(async (error) => {
        if (error instanceof Response) {
          const data = await error.json()
          setError(data.message)
          return
        }
        setError(error.message)
      })
  }

  return (
    <div className="signin">
      <main className="form-signin w-100 m-auto text-center">
        <form method="post" onSubmit={handleSubmit}>
          {error ? <div className="alert alert-danger my-0">{error}</div> : null}
          <div className="form-floating">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-control"
              id="floatingPassword"
              placeholder="Пароль"
            />
            <label htmlFor="floatingPassword">Пароль</label>
          </div>
          <button className="w-100 btn btn-lg btn-primary" type="submit">
            Войти
          </button>
        </form>
      </main>
    </div>
  )
}

export default Login
