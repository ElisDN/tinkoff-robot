import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.scss'
import App from './App'
import AuthProvider from './auth/AuthProvider'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
)
