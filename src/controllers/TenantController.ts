import { NextFunction, Request, Response } from 'express'
import { TenantService } from '../services/TenantService'
import { CreateTenantRequest } from '../types'
import { Logger } from 'winston'
import { validationResult } from 'express-validator'
import createHttpError from 'http-errors'

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

  async getAllTenants(req: Request, res: Response, next: NextFunction) {
    this.logger.debug('New request to get all tenants')
    try {
      const tenants = await this.tenantService.getAll()
      this.logger.info('Tenants have been fetched')
      res.json(tenants)
    } catch (error) {
      next(error)
      return
    }
  }

  async getOneTenant(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params
    this.logger.debug('New request to get one tenant', { id })
    if (isNaN(Number(id))) {
      next(createHttpError(400, 'Invalid url param.'))
      return
    }

    try {
      const tenant = await this.tenantService.getOne(Number(id))
      if (!tenant) {
        res.status(404).json({ message: 'Tenant not found' })
        return
      }
      this.logger.info('Tenant has been fetched', { id: tenant.id })
      res.json(tenant)
    } catch (error) {
      next(error)
      return
    }
  }

  async updateTenant(
    req: CreateTenantRequest,
    res: Response,
    next: NextFunction,
  ) {
    const result = validationResult(req)
    if (!result.isEmpty()) {
      res.status(400).json({ errors: result.array() })
      return
    }

    const { id } = req.params
    const { name, address } = req.body
    this.logger.debug('New request to update tenant', { id })
    try {
      if (isNaN(Number(id))) {
        next(createHttpError(400, 'Invalid url param.'))
        return
      }
      const tenant = await this.tenantService.getOne(Number(id))
      if (!tenant) {
        res.status(404).json({ message: 'Tenant not found' })
        return
      }
      const isTenantExist = await this.tenantService.getOneByName(name)
      if (isTenantExist) {
        res.status(400).json({ message: 'Tenant with this name already exist' })
        return
      }
      await this.tenantService.update(Number(id), { name, address })
      this.logger.info('Tenant has been updated', { id: tenant.id })
      res.json({ message: 'Tenant has been updated' })
    } catch (error) {
      next(error)
      return
    }
  }

  async deleteTenant(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params
    this.logger.debug('New request to delete tenant', { id })
    try {
      const tenant = await this.tenantService.getOne(Number(id))
      if (!tenant) {
        res
          .status(404)
          .json({ message: 'Tenant you are trying to delete does not exist' })
        return
      }
      await this.tenantService.delete(Number(id))
      this.logger.info('Tenant has been deleted', { id: tenant.id })
      res.json({ message: 'Tenant has been deleted' })
    } catch (error) {
      next(error)
      return
    }
  }
}
