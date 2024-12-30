import request from 'supertest'
import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import app from '../../src/app'
import { App } from 'supertest/types'
import { Tenant } from '../../src/entity/Tenant'
import createJWKSMock from 'mock-jwks'
import { Roles } from '../../src/constants'

describe('POST /tenants', () => {
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
    adminToken = jwks.token({ sub: '1', role: Roles.ADMIN })
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
      const tenantData = {
        name: 'Tenant1',
        address: 'Address1',
      }

      // Act
      const response = await request(app as unknown as App)
        .post('/tenants')
        .set('Cookie', [`accessToken=${adminToken};`])
        .send(tenantData)

      // Assert
      expect(response.statusCode).toBe(201)
    })

    it('should return id of created tenant', async () => {
      // Arrange
      const tenantData = {
        name: 'Tenant1',
        address: 'Address1',
      }

      // Act
      await request(app as unknown as App)
        .post('/tenants')
        .set('Cookie', [`accessToken=${adminToken};`])
        .send(tenantData)

      // Assert
      const tenantRepository = connection.getRepository(Tenant)
      const tenants = await tenantRepository.find()
      expect(tenants).toHaveLength(1)
      expect(tenants[0].name).toBe(tenantData.name)
      expect(tenants[0].address).toBe(tenantData.address)
    })

    it('should return 401 status code if user is not authenticated ', async () => {
      // Arrange
      const tenantData = {
        name: 'Tenant1',
        address: 'Address1',
      }

      // Act
      const response = await request(app as unknown as App)
        .post('/tenants')
        .send(tenantData)

      // Assert
      const tenantRepository = connection.getRepository(Tenant)
      const tenants = await tenantRepository.find()
      expect(response.statusCode).toBe(401)
      expect(tenants).toHaveLength(0)
    })

    it('should return 403 status code if user is not admin ', async () => {
      // Arrange
      const managerToken = jwks.token({ sub: '1', role: Roles.MANAGER })
      const tenantData = {
        name: 'Tenant1',
        address: 'Address1',
      }

      // Act
      const response = await request(app as unknown as App)
        .post('/tenants')
        .set('Cookie', [`accessToken=${managerToken};`])
        .send(tenantData)

      // Assert
      const tenantRepository = connection.getRepository(Tenant)
      const tenants = await tenantRepository.find()
      expect(response.statusCode).toBe(403)
      expect(tenants).toHaveLength(0)
    })
  })
  describe('Fields are missing', () => {})
})
