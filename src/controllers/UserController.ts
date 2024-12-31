import { NextFunction, Response } from 'express'
import { Logger } from 'winston'
import { UserService } from '../services/UserService'
import { CreateUserRequest } from '../types'
import { Roles } from '../constants'
import { validationResult } from 'express-validator'

export class UserController {
  constructor(
    private userService: UserService,
    private logger: Logger,
  ) {}
  async create(req: CreateUserRequest, res: Response, next: NextFunction) {
    try {
      this.logger.debug('New request to create a user')
      const result = validationResult(req)
      if (!result.isEmpty()) {
        res.status(400).json({ errors: result.array() })
        return
      }
      const { firstName, lastName, email, password } = req.body
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role: Roles.MANAGER,
      })
      res.status(201).json({ id: user.id })
    } catch (error) {
      next(error)
      return
    }
  }
}
