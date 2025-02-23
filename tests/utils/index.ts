import { DataSource, Repository } from 'typeorm'
import { Tenant } from '../../src/entity/Tenant'

export const truncateTables = async (connection: DataSource) => {
  // Provide all the entities(tables) from database
  const entities = connection.entityMetadatas

  for (const entity of entities) {
    const repository = connection.getRepository(entity.name)
    await repository.clear()
  }
}

export const isJwt = (token: string | null): boolean => {
  if (!token) {
    return false
  }

  const parts = token.split('.')

  if (parts.length !== 3) {
    return false
  }

  try {
    parts.forEach((part) => {
      // convert base64 encoded string to a utf-8 string
      Buffer.from(part, 'base64').toString('utf-8')
    })
    return true
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return false
  }
}

export const createTenant = async (repository: Repository<Tenant>) => {
  const tenant = await repository.save({
    name: 'test tenant',
    address: 'test tenant description',
  })
  return tenant
}
