import request from 'supertest'
import createJWKSMock from 'mock-jwks'
import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import app from '../../src/app'
import { App } from 'supertest/types'
import { User } from '../../src/entity/User'
import { Roles } from '../../src/constants'

describe('GET /auth/self', () => {
  let connection: DataSource
  let jwks: ReturnType<typeof createJWKSMock>

  // Setting up tear down for Database like make connection with it, clear before each test case and destroy the connection after all.

  // will run before all testcases to make connection with database
  beforeAll(async () => {
    // URL where the jwks will host keys for testing
    jwks = createJWKSMock('http://localhost:8000')
    connection = await AppDataSource.initialize()
  })

  // will tun before each test case to drop database and synchronize the database for any new added column or anything in schema
  beforeEach(async () => {
    // start the mock server before each test
    jwks.start()
    await connection.dropDatabase()
    await connection.synchronize()
  })

  // After each test case stop the mock server
  afterEach(() => {
    // stop the mock server after each test
    jwks.stop()
  })

  // will run after all testcases run to close the connection with Database
  afterAll(async () => {
    await connection.destroy()
  })

  describe('Given all fields', () => {
    it('should return 200 status code', async () => {
      // Arrange
      const accesssToken = jwks.token({ sub: '1', role: Roles.CUSTOMER })

      // Act
      const response = await request(app as unknown as App)
        .get('/auth/self')
        .set('Cookie', [`accessToken=${accesssToken};`])
        .send()

      // Assert
      expect(response.statusCode).toBe(200)
    })

    it('should return the user data', async () => {
      // Arrange
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: '9B9yZ@example.com',
        password: 'password123',
      }

      // Act
      // register user
      const userRepository = connection.getRepository(User)
      const data = await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      })

      //generate token
      const accesssToken = jwks.token({ sub: String(data.id), role: data.role })

      // add token to cookie
      const response = await request(app as unknown as App)
        .get('/auth/self')
        .set('Cookie', [`accessToken=${accesssToken};`])
        .send()

      // Assert
      // check if user id is match with registerd user
      expect((response.body as Record<string, string>).id).toBe(data.id)
    })

    it('should not return the password field', async () => {
      // Arrange
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: '9B9yZ@example.com',
        password: 'password123',
      }

      // Act
      // register user
      const userRepository = connection.getRepository(User)
      const data = await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      })

      //generate token
      const accesssToken = jwks.token({ sub: String(data.id), role: data.role })

      // add token to cookie
      const response = await request(app as unknown as App)
        .get('/auth/self')
        .set('Cookie', [`accessToken=${accesssToken};`])
        .send()

      // Assert
      // check if user id is match with registerd user
      expect(response.body as Record<string, string>).not.toHaveProperty(
        'password',
      )
    })

    it('should not return 401 status code if token does not exists', async () => {
      // Arrange
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: '9B9yZ@example.com',
        password: 'password123',
      }

      // Act
      // register user
      const userRepository = connection.getRepository(User)
      await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      })

      // add token to cookie
      const response = await request(app as unknown as App)
        .get('/auth/self')
        .send()

      // Assert
      // check if user id is match with registerd user
      expect(response.statusCode).toBe(401)
    })
  })
})
