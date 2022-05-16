import { createContext } from 'react'

export type Value = {
  isAuthenticated: boolean
  getToken(): Promise<string>
  login(token: string, expires: number): void
  logout(): void
}

const AuthContext = createContext<Value>({
  isAuthenticated: false,
  getToken: () => Promise.reject(new Error()),
  login: () => null,
  logout: () => null,
})

export default AuthContext
