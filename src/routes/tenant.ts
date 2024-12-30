import express, { NextFunction, Request, Response } from 'express'
import { TenantController } from '../controllers/TenantController'
import { TenantService } from '../services/TenantService'
import { AppDataSource } from '../config/data-source'
import { Tenant } from '../entity/Tenant'
import logger from '../config/logger'
import authenticate from '../middlewares/authenticate'
import { canAccess } from '../middlewares/canAccess'
import { Roles } from '../constants'
import tenantRequestValidator from '../validators/tenant-request-validator'

const router = express.Router()
const tenantRepository = AppDataSource.getRepository(Tenant)
const tenantServie = new TenantService(logger, tenantRepository)
const tenantController = new TenantController(logger, tenantServie)

router.post(
  '/',
  tenantRequestValidator,
  authenticate,
  canAccess([Roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.create(req, res, next),
)

export default router
