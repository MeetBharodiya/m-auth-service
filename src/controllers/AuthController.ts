import { NextFunction, Response } from 'express'
import { RegisterUserRequest } from '../types'
import { UserService } from '../services/UserService'
import { Logger } from 'winston'
import { validationResult } from 'express-validator'

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
      res.status(201).json({ id: user.id })
    } catch (error) {
      next(error)
      return
    }
  }
}
