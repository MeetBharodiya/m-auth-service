import { NextFunction, Request, Response } from 'express'
import { Logger } from 'winston'
import { UserService } from '../services/UserService'
import { CreateUserRequest, UserData } from '../types'
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
      const { firstName, lastName, email, password, tenantId, role } = req.body

      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role,
        tenantId,
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

  async updateUser(req: CreateUserRequest, res: Response, next: NextFunction) {
    try {
      this.logger.debug('New request to update one user')

      const result = validationResult(req)
      if (!result.isEmpty()) {
        res.status(400).json({ errors: result.array() })
        return
      }
      const { id } = req.params
      const updates: Partial<UserData> = req.body

      const user = await this.userService.findById(Number(id))
      if (!user) {
        res.status(404).json({ message: 'User not found' })
        return
      }
      await this.userService.update(Number(id), updates)
      res.json({ message: 'User had been updated successfully' })
    } catch (error) {
      next(error)
      return
    }
  }

  async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      this.logger.debug('New request to delete one user')
      const { id } = req.params
      const user = await this.userService.findById(Number(id))
      if (!user) {
        res.status(404).json({ message: 'User not found' })
        return
      }
      await this.userService.delete(Number(id))
      res.sendStatus(204)
    } catch (error) {
      next(error)
      return
    }
  }
}
