import request from 'supertest'
import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import { User } from '../../src/entity/User'
import app from '../../src/app'
import { App } from 'supertest/types'
import { Roles } from '../../src/constants'

describe('POST /auth/register', () => {
  let connection: DataSource

  // Setting up tear down for Database like make connection with it, clear before each test case and destroy the connection after all.

  // will run before all testcases to make connection with database
  beforeAll(async () => {
    connection = await AppDataSource.initialize()
  })

  // will tun before each test case to drop database and synchronize the database for any new added column or anything in schema
  beforeEach(async () => {
    await connection.dropDatabase()
    await connection.synchronize()
  })

  // will run after all testcases run to close the connection with Database
  afterAll(async () => {
    await connection.destroy()
  })

  describe('Given all fields', () => {
    it('should return 201 status code', async () => {
      // FOLLOW AAA rule to write any test cases

      // Arrange
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: '9B9yZ@example.com',
        password: 'password123',
      }

      // Act
      const response = await request(app as unknown as App)
        .post('/auth/register')
        .send(userData)

      // Assert
      expect(response.statusCode).toBe(201)
    })

    it('should return valid json response', async () => {
      //Arrange
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: '9B9yZ@example.com',
        password: 'password123',
      }

      //Act
      const response = await request(app as unknown as App)
        .post('/auth/register')
        .send(userData)

      //Assert application/json
      expect(
        (response.headers as Record<string, string>)['content-type'],
      ).toEqual(expect.stringContaining('json'))
    })

    it('should persist the user in database', async () => {
      //Arrange
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: '9B9yZ@example.com',
        password: 'password123',
      }

      //Act
      await request(app as unknown as App)
        .post('/auth/register')
        .send(userData)

      //Assert
      const userRepository = connection.getRepository(User)
      const users = await userRepository.find()
      expect(users).toHaveLength(1)
      expect(users[0].firstName).toBe(userData.firstName)
      expect(users[0].lastName).toBe(userData.lastName)
      expect(users[0].email).toBe(userData.email)
    })

    it('should return userid in response', async () => {
      //Arrange
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: '9B9yZ@example.com',
        password: 'password123',
      }

      //Act
      const response = await request(app as unknown as App)
        .post('/auth/register')
        .send(userData)

      //Assert
      expect(response.body).toHaveProperty('id')
      const repository = connection.getRepository(User)
      const users = await repository.find()
      expect((response.body as Record<string, string>).id).toBe(users[0].id)
    })

    it('should assign customer role', async () => {
      //Arrange
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: '9B9yZ@example.com',
        password: 'password123',
      }

      //Act
      await request(app as unknown as App)
        .post('/auth/register')
        .send(userData)

      //Assert
      const repository = connection.getRepository(User)
      const users = await repository.find()
      expect(users[0]).toHaveProperty('role')
      expect(users[0].role).toBe(Roles.CUSTOMER)
    })
  })
  describe('Fields are missing', () => {})
})
