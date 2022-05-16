import React from 'react'
import Home from './Home'
import useAuth from './auth/useAuth'
import Login from './Login'

function App() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Login />
  }

  return <Home />
}

export default App
