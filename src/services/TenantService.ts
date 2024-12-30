import { Logger } from 'winston'
import { Tenant } from '../entity/Tenant'
import { Repository } from 'typeorm'
import { ITenant } from '../types'
import createHttpError from 'http-errors'

export class TenantService {
  constructor(
    private logger: Logger,
    private tenantRepository: Repository<Tenant>,
  ) {}
  async create(tenantData: ITenant) {
    const tenant = await this.tenantRepository.findOne({
      where: { name: tenantData.name },
    })
    if (tenant) {
      const err = createHttpError(400, 'Tenant already exists')
      throw err
    }
    return await this.tenantRepository.save(tenantData)
  }

  async getAll() {
    return await this.tenantRepository.find()
  }

  async getOneByName(name: string) {
    return await this.tenantRepository.findOne({ where: { name: name } })
  }

  async getOne(id: number) {
    return await this.tenantRepository.findOne({ where: { id: id } })
  }

  async update(id: number, tenantData: ITenant) {
    return await this.tenantRepository.update({ id: id }, tenantData)
  }

  async delete(id: number) {
    return await this.tenantRepository.delete({ id: id })
  }
}
