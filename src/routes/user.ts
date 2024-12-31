import express, { NextFunction, Request, Response } from 'express'
import authenticate from '../middlewares/authenticate'
import { canAccess } from '../middlewares/canAccess'
import { Roles } from '../constants'
import tenantRequestValidator from '../validators/tenant-request-validator'
import { UserController } from '../controllers/UserController'
import { UserService } from '../services/UserService'
import logger from '../config/logger'
import { AppDataSource } from '../config/data-source'
import { User } from '../entity/User'

const router = express.Router()
const userRepository = AppDataSource.getRepository(User)
const userService = new UserService(userRepository, logger)
const userController = new UserController(userService, logger)

router.post(
  '/',
  tenantRequestValidator,
  authenticate,
  canAccess([Roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) =>
    userController.create(req, res, next),
)
export default router
