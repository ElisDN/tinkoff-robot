import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export function createAuthAction(password: string, secret: string, timeout: number) {
  return (req: Request, res: Response) => {
    if (!req.body.password) {
      res.status(422).json({ message: 'Заполните пароль' })
      return
    }
    if (req.body.password !== password) {
      res.status(409).json({ message: 'Неверный пароль' })
      return
    }
    const token = jwt.sign({}, secret, { expiresIn: timeout })
    res.status(200).json({ token, expires: timeout })
  }
}

export function createAuthMiddleware(secret: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
      res.status(401).end()
      return
    }
    const token = req.headers.authorization.split(' ')[1]
    jwt.verify(token, secret, (err) => {
      if (err) {
        console.log(err)
        res.status(401).end()
      } else {
        next()
      }
    })
  }
}
