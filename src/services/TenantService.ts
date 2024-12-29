import { Logger } from 'winston'
import { Tenant } from '../entity/Tenant'
import { Repository } from 'typeorm'
import { ITenant } from '../types'

export class TenantService {
  constructor(
    private logger: Logger,
    private tenantRepository: Repository<Tenant>,
  ) {}
  async create(tenantData: ITenant) {
    return await this.tenantRepository.save(tenantData)
  }
}
