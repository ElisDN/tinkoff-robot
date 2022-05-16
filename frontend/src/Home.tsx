import React, { useEffect, useState } from 'react'
import useAuth from './auth/useAuth'

function Home() {
  const { getToken } = useAuth()

  const [content, setContent] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getToken()
      .then((token) => {
        fetch(process.env.REACT_APP_API_HOST + '/api', {
          headers: { Authorization: 'Bearer ' + token },
        })
          .then((response) => response.json())
          .then((data) => setContent(data))
          .catch((error) => setError(error.message || error.statusText))
      })
      .catch(() => null)
  }, [])

  return (
    <div className="container">
      {error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : null}
      <p>{JSON.stringify(content)}</p>
    </div>
  )
}

export default Home
