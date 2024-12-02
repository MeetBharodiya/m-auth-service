import { Response } from 'express'
import { RegisterUserRequest } from '../types'
import { UserService } from '../services/UserService'

export class AuthController {
  // Created to use Dependency Injection as we can't craete instance of UserService in register function to reduce the depandency
  constructor(private userService: UserService) {}

  async register(req: RegisterUserRequest, res: Response) {
    const { firstName, lastName, email, password } = req.body
    await this.userService.create({ firstName, lastName, email, password })
    res.status(201).json()
  }
}
