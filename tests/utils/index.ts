import { DataSource } from 'typeorm'

export const truncateTables = async (connection: DataSource) => {
  // Provide all the entities(tables) from database
  const entities = connection.entityMetadatas

  for (const entity of entities) {
    const repository = connection.getRepository(entity.name)
    await repository.clear()
  }
}
