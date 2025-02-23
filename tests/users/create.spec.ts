import request from 'supertest'
import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import app from '../../src/app'
import { App } from 'supertest/types'
import createJWKSMock from 'mock-jwks'
import { Roles } from '../../src/constants'
import { User } from '../../src/entity/User'
import { createTenant } from '../utils'
import { Tenant } from '../../src/entity/Tenant'

describe('POST /users', () => {
  let connection: DataSource
  let jwks: ReturnType<typeof createJWKSMock>
  let adminToken: string

  // Setting up tear down for Database like make connection with it, clear before each test case and destroy the connection after all.

  // will run before all testcases to make connection with database
  beforeAll(async () => {
    jwks = createJWKSMock('http://localhost:8000')
    connection = await AppDataSource.initialize()
  })

  // will tun before each test case to drop database and synchronize the database for any new added column or anything in schema
  beforeEach(async () => {
    jwks.start()
    await connection.dropDatabase()
    await connection.synchronize()
  })

  // will run after all testcases run to close the connection with Database
  afterAll(async () => {
    await connection.destroy()
  })

  // After each test case stop the mock server
  afterEach(() => {
    // stop the mock server after each test
    jwks.stop()
  })

  describe('Given all fields', () => {
    it('should return 201 status code', async () => {
      // Arrange

      const tenant = await createTenant(connection.getRepository(Tenant))

      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'temp@example.com',
        password: 'password123',
        tenantId: tenant.id,
        role: Roles.ADMIN,
      }

      adminToken = jwks.token({ sub: '1', role: Roles.ADMIN })

      // Act

      const response = await request(app as unknown as App)
        .post('/users')
        .set('Cookie', [`accessToken=${adminToken};`])
        .send(userData)

      // Assert
      // console.log(response)

      expect(response.statusCode).toBe(201)
    })

    it('should persist the user in database', async () => {
      // Arrange

      const tenant = await createTenant(connection.getRepository(Tenant))

      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'temp@example.com',
        password: 'password123',
        tenantId: tenant.id,
        role: Roles.MANAGER,
      }

      adminToken = jwks.token({ sub: '1', role: Roles.ADMIN })

      // Act
      await request(app as unknown as App)
        .post('/users')
        .set('Cookie', [`accessToken=${adminToken};`])
        .send(userData)

      // Assert
      const userRepository = connection.getRepository(User)
      const users = await userRepository.find()
      expect(users).toHaveLength(1)
    })

    it('should create a manager user', async () => {
      // Arrange
      const tenant = await createTenant(connection.getRepository(Tenant))
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'temp@example.com',
        password: 'password123',
        tenantId: tenant.id,
        role: Roles.MANAGER,
      }

      adminToken = jwks.token({ sub: '1', role: Roles.ADMIN })

      // Act
      await request(app as unknown as App)
        .post('/users')
        .set('Cookie', [`accessToken=${adminToken};`])
        .send(userData)

      // Assert
      const userRepository = connection.getRepository(User)
      const users = await userRepository.find()
      expect(users).toHaveLength(1)
      expect(users[0].role).toBe(Roles.MANAGER)
    })
  })
})
