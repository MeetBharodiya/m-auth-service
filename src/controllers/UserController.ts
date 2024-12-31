import { NextFunction, Request, Response } from 'express'
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

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      this.logger.debug('New request to get all users')
      const users = await this.userService.getAll()
      res.json(users)
    } catch (error) {
      next(error)
      return
    }
  }

  async getOneUser(req: Request, res: Response, next: NextFunction) {
    try {
      this.logger.debug('New request to get one user')
      const { id } = req.params
      const user = await this.userService.findById(Number(id))
      if (!user) {
        res.status(404).json({ message: 'User not found' })
        return
      }
      res.json(user)
    } catch (error) {
      next(error)
      return
    }
  }
}
