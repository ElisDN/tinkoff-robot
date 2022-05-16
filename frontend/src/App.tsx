import React from 'react'
import Home from './Home'
import useAuth from './auth/useAuth'
import Login from './Login'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import NotFound from './NotFound'
import Account from './Account'

function App() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:accountId" element={<Account />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
