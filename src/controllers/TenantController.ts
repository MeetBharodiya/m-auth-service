import { NextFunction, Response } from 'express'
import { TenantService } from '../services/TenantService'
import { CreateTenantRequest } from '../types'
import { Logger } from 'winston'
import { validationResult } from 'express-validator'

export class TenantController {
  constructor(
    private logger: Logger,
    private tenantService: TenantService,
  ) {}
  async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
    const result = validationResult(req)
    if (!result.isEmpty()) {
      this.logger.error('Validation error', { errors: result.array() })
      res.status(400).json({ errors: result.array() })
      return
    }
    const { name, address } = req.body
    this.logger.debug('New request to create a tenant', { name })
    try {
      const tenant = await this.tenantService.create({ name, address })
      this.logger.info('Tenant has been created', { id: tenant.id })
      res.status(201).json({ id: tenant.id })
    } catch (error) {
      next(error)
      return
    }
  }
}
