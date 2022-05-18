import React from 'react'
import useAuth from './auth/useAuth'
import Login from './login/Login'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import NotFound from './NotFound'
import AccountPage from './home/account/AccountPage'
import HomePage from './home/HomePage'

function App() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:accountId" element={<AccountPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
