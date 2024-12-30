import { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'
import { AuthRequest } from '../types'

export const canAccess = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // typecast req here as can't possible to do in in middleware
    const _req = req as AuthRequest
    const roleFromToken = _req.auth.role
    if (!roles.includes(roleFromToken)) {
      const error = createHttpError(
        403,
        'You are not allowed to access this resource',
      )
      next(error)
      return
    }
    next()
  }
}
