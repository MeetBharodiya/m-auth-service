import { NextFunction, Response } from 'express'
import { AuthRequest, RegisterUserRequest } from '../types'
import { UserService } from '../services/UserService'
import { Logger } from 'winston'
import { validationResult } from 'express-validator'
import { JwtPayload } from 'jsonwebtoken'
import { TokenService } from '../services/TokenService'
import createHttpError from 'http-errors'
import { CredentialService } from '../services/CredentialService'
import { Roles } from '../constants'

export class AuthController {
  // Created to use Dependency Injection as we can't craete instance of UserService in register function to reduce the depandency
  constructor(
    private userService: UserService,
    private logger: Logger,
    private tokenService: TokenService,
    private credentialService: CredentialService,
  ) {}

  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
    // validate req usging express-validator
    const result = validationResult(req)
    if (!result.isEmpty()) {
      this.logger.error('Validation error', { errors: result.array() })
      res.status(400).json({ errors: result.array() })
      return
    }
    const { firstName, lastName, email, password } = req.body
    this.logger.debug('New request to register a user', {
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
        role: Roles.CUSTOMER,
      })
      this.logger.info('User has been registered', { id: user.id })

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      }

      const accessToken = this.tokenService.generateAccessToken(payload)

      const newRefreshToken = await this.tokenService.persistRefreshToken(user)

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      })

      res.cookie('accessToken', accessToken, {
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

  async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
    // validate req usging express-validator
    const result = validationResult(req)
    if (!result.isEmpty()) {
      this.logger.error('Validation error', { errors: result.array() })
      res.status(400).json({ errors: result.array() })
    }
    const { email, password } = req.body
    this.logger.debug('New request to login a user', {
      email,
    })
    try {
      // check if user exists or not with given email
      const user = await this.userService.findByEmail(email)
      if (!user) {
        const error = createHttpError(
          400,
          'Email or Password does not match !!',
        )
        next(error)
        return
      }

      // check if password is correct or not
      const isPasswordMatched = await this.credentialService.checkPassword(
        password,
        user.password,
      )

      if (!isPasswordMatched) {
        const error = createHttpError(
          400,
          'Email or Password does not match !!',
        )
        next(error)
        return
      }
      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      }

      const accesssToken = this.tokenService.generateAccessToken(payload)

      const newRefreshToken = await this.tokenService.persistRefreshToken(user)

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
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
      this.logger.info('User has been logged in', { id: user.id })
      res.json({ id: user.id })
    } catch (error) {
      next(error)
      return
    }
  }

  async self(req: AuthRequest, res: Response) {
    const user = await this.userService.findById(Number(req.auth.sub))
    res.json({ ...user, password: undefined })
  }

  async refresh(req: AuthRequest, res: Response, next: NextFunction) {
    // refresh token is already validated in validateRefreshToken middleware so now do process to generate accesstoken for the same user
    try {
      const payload: JwtPayload = {
        sub: req.auth.sub,
        role: req.auth.role,
      }

      const user = await this.userService.findById(Number(payload.sub))

      if (!user) {
        const error = createHttpError(400, 'User with token could not find !!')
        next(error)
        return
      }

      const accessToken = this.tokenService.generateAccessToken(payload)
      const newRefreshToken = await this.tokenService.persistRefreshToken(user)
      // delete old refresh token
      await this.tokenService.deleteRefreshToken(Number(req.auth.id))

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      })
      res.cookie('accessToken', accessToken, {
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

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await this.tokenService.deleteRefreshToken(Number(req.auth.id))
      this.logger.info('User has been logged out', { id: req.auth.sub })
      res.clearCookie('accessToken')
      res.clearCookie('refreshToken')
      res.json({})
    } catch (error) {
      next(error)
      return
    }
  }
}
