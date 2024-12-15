import express, { NextFunction, Request, Response } from 'express'
import { AuthController } from '../controllers/AuthController'
import { UserService } from '../services/UserService'
import { AppDataSource } from '../config/data-source'
import { User } from '../entity/User'
import logger from '../config/logger'
import registerValidator from '../validators/register-validator'

const router = express.Router()
const userRepository = AppDataSource.getRepository(User)
// const logger = new Logger()
const userService = new UserService(userRepository, logger)
const authController = new AuthController(userService, logger)

// added (req,res) => function calling to solve bind issue in class methods
router.post(
  '/register',
  registerValidator,
  (req: Request, res: Response, next: NextFunction) =>
    authController.register(req, res, next),
)

export default router
