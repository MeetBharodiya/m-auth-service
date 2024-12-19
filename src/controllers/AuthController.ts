import fs from 'fs'
import path from 'path'
import { NextFunction, Response } from 'express'
import { RegisterUserRequest } from '../types'
import { UserService } from '../services/UserService'
import { Logger } from 'winston'
import { validationResult } from 'express-validator'
import { JwtPayload, sign } from 'jsonwebtoken'
import createHttpError from 'http-errors'
import { Config } from '../config'

export class AuthController {
  // Created to use Dependency Injection as we can't craete instance of UserService in register function to reduce the depandency
  constructor(
    private userService: UserService,
    private logger: Logger,
  ) {}

  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
    // validate req usging express-validator
    const result = validationResult(req)
    if (!result.isEmpty()) {
      this.logger.error('Validation error', { errors: result.array() })
      res.status(400).json({ errors: result.array() })
    }
    const { firstName, lastName, email, password } = req.body
    this.logger.debug('New request to regester a user', {
      firstName,
      lastName,
      email,
    })
    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
      })
      this.logger.info('User has been registered', { id: user.id })
      let privatKey: Buffer
      try {
        privatKey = fs.readFileSync(
          path.join(__dirname, '../../certs/privateKey.pem'),
        )
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        const error = createHttpError(500, 'Error while reading private key')
        next(error)
        return
      }

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      }
      const accesssToken = sign(payload, privatKey, {
        algorithm: 'RS256', // Need pair of keys to sign and verify the token
        expiresIn: Config.ACCESS_TOKEN_EXPIRES_IN,
        issuer: 'auth-service',
      })
      // measning of ! is we are sure that REFRESH_TOKEN_SECRET will never be undefined
      const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
        algorithm: 'HS256',
        expiresIn: Config.REFRESH_TOKEN_EXPIRES_IN,
        issuer: 'auth-service',
      })

      res.cookie('accessToken', accesssToken, {
        httpOnly: true, // restrict access to only server
        domain: 'localhost',
        maxAge: 1000 * 60 * 60, // 1 hour
        sameSite: 'strict',
      })

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true, // restrict access to only server
        domain: 'localhost',
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
        sameSite: 'strict',
      })
      res.status(201).json({ id: user.id })
    } catch (error) {
      next(error)
      return
    }
  }
}
