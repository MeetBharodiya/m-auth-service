import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { Config } from '.'

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: Config.DB_HOST,
  port: Number(Config.DB_PORT),
  username: Config.DB_USERNAME,
  password: Config.DB_PASSWORD,
  database: Config.DB_NAME,
  // value must false in prod environment because data loss can occure
  synchronize: false,
  logging: false,
  entities: ['src/entity/*.ts'],
  migrations: ['src/migration/*.ts'],
  subscribers: [],
})
