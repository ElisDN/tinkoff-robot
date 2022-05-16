import React, { useCallback, useMemo, useState } from 'react'
import AuthContext, { Value } from './AuthContext'

type Props = {
  children: React.ReactNode
}

type Tokens = {
  token: string
  expires: number
}

function AuthProvider({ children }: Props) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(window.localStorage.getItem('auth.tokens') !== null)

  const login = useCallback((token: string, expires: number): void => {
    const tokens: Tokens = {
      token,
      expires: new Date().getTime() + expires * 1000,
    }
    window.localStorage.setItem('auth.tokens', JSON.stringify(tokens))
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback((): void => {
    window.localStorage.removeItem('auth.tokens')
    setIsAuthenticated(false)
  }, [])

  const getToken = useCallback(async (): Promise<string> => {
    const tokens = JSON.parse(window.localStorage.getItem('auth.tokens') || 'null') as Tokens | null

    if (tokens === null) {
      return Promise.reject(new Error())
    }

    if (tokens.expires > new Date().getTime()) {
      return Promise.resolve(tokens.token)
    }

    window.localStorage.removeItem('auth.tokens')
    setIsAuthenticated(false)

    return Promise.reject(new Error())
  }, [])

  const contextValue = useMemo<Value>(
    () => ({
      isAuthenticated,
      getToken,
      login,
      logout,
    }),
    [isAuthenticated, getToken, login, logout]
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export default AuthProvider
