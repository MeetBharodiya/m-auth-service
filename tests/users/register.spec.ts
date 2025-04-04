import request from 'supertest'
import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import { User } from '../../src/entity/User'
import app from '../../src/app'
import { App } from 'supertest/types'
import { Roles } from '../../src/constants'
import { isJwt } from '../utils'
import { RefreshToken } from '../../src/entity/RefreshToken'

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

    it('should store the hashed password in the database', async () => {
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
      expect(users[0].password).not.toBe(userData.password)
      expect(users[0].password).toHaveLength(60)
      expect(users[0].password).toMatch(/^\$2b\$\d+\$/)
    })

    it('should return 400 status code if email is already exists', async () => {
      //Arrange
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: '9B9yZ@example.com',
        password: 'password123',
      }
      // add manually user from test case to check email with one exsiting user
      const userRepository = connection.getRepository(User)
      await userRepository.save({ ...userData, role: Roles.CUSTOMER })

      //Act
      const response = await request(app as unknown as App)
        .post('/auth/register')
        .send(userData)

      //Assert
      const users = await userRepository.find()
      expect(response.statusCode).toBe(400)
      expect(users).toHaveLength(1)
    })

    it('should return access token and refresh token in cookie', async () => {
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

      interface Header {
        ['set-cookie']: string[]
      }

      //Assert
      let accessToken = null
      let refreshToken = null
      const cookies =
        (response.headers as unknown as Header)['set-cookie'] || []

      cookies.forEach((cookie) => {
        if (cookie.startsWith('accessToken=')) {
          accessToken = cookie.split(';')[0].split('=')[1]
        }
        if (cookie.startsWith('refreshToken=')) {
          refreshToken = cookie.split(';')[0].split('=')[1]
        }
      })
      expect(accessToken).not.toBeNull()
      expect(refreshToken).not.toBeNull()
      expect(isJwt(accessToken)).toBeTruthy()
      expect(isJwt(refreshToken)).toBeTruthy()
    })

    it('should store the refresh token in the database', async () => {
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
      const refreshTokenRepository = connection.getRepository(RefreshToken)
      const tokens = await refreshTokenRepository
        .createQueryBuilder('refreshToken')
        .where('refreshToken.userId = :userId', {
          userId: (response.body as Record<string, string>).id,
        })
        .getMany()
      expect(tokens).toHaveLength(1)
    })
  })
  describe('Fields are missing', () => {
    it('should return 400 status code if email field is missing', async () => {
      //Arrange
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: '',
        password: 'password123',
      }

      //Act
      const response = await request(app as unknown as App)
        .post('/auth/register')
        .send(userData)

      //Assert
      expect(response.statusCode).toBe(400)
      expect(response.body).toHaveProperty('errors')
      expect((response.body as { errors: [] }).errors).toBeInstanceOf(Array)
      const userRepository = connection.getRepository(User)
      const users = await userRepository.find()
      expect(users).toHaveLength(0)
    })

    it('should return 400 status code if firstName field is missing', async () => {
      //Arrange
      const userData = {
        firstName: '',
        lastName: 'Doe',
        email: '9B9yZ@example.com',
        password: 'password123',
      }

      //Act
      const response = await request(app as unknown as App)
        .post('/auth/register')
        .send(userData)

      //Assert
      expect(response.statusCode).toBe(400)
      const userRepository = connection.getRepository(User)
      const users = await userRepository.find()
      expect(users).toHaveLength(0)
    })

    it('should return 400 status code if lastName field is missing', async () => {
      //Arrange
      const userData = {
        firstName: 'John',
        lastName: '',
        email: '9B9yZ@example.com',
        password: 'password123',
      }

      //Act
      const response = await request(app as unknown as App)
        .post('/auth/register')
        .send(userData)

      //Assert
      expect(response.statusCode).toBe(400)
      const userRepository = connection.getRepository(User)
      const users = await userRepository.find()
      expect(users).toHaveLength(0)
    })

    it('should return 400 status code if password field is missing', async () => {
      //Arrange
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: '9B9yZ@example.com',
        password: '',
      }

      //Act
      const response = await request(app as unknown as App)
        .post('/auth/register')
        .send(userData)

      //Assert
      expect(response.statusCode).toBe(400)
      const userRepository = connection.getRepository(User)
      const users = await userRepository.find()
      expect(users).toHaveLength(0)
    })
  })

  describe('Fields are not in proper format', () => {
    it('should trim email field', async () => {
      //Arrange
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: '   9B9yZ@example.com   ',
        password: 'password123',
      }

      //Act
      await request(app as unknown as App)
        .post('/auth/register')
        .send(userData)

      //Assert
      const userRepository = connection.getRepository(User)
      const users = await userRepository.find()
      expect(users[0].email).toBe('9B9yZ@example.com')
    })

    it('should rerun 400 status code if email field is not in proper format', async () => {
      //Arrange
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'user@..com',
        password: 'password123',
      }

      //Act
      const response = await request(app as unknown as App)
        .post('/auth/register')
        .send(userData)

      //Assert
      expect(response.statusCode).toBe(400)
      const userRepository = connection.getRepository(User)
      const users = await userRepository.find()
      expect(users).toHaveLength(0)
    })

    it('should rerun 400 status code if password length is less than 8 characters', async () => {
      //Arrange
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: '9B9yZ@example.com',
        password: 'pass',
      }

      //Act
      const response = await request(app as unknown as App)
        .post('/auth/register')
        .send(userData)

      //Assert
      expect(response.statusCode).toBe(400)
      const userRepository = connection.getRepository(User)
      const users = await userRepository.find()
      expect(users).toHaveLength(0)
    })
  })
})
