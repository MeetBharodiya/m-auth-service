import request from 'supertest'
import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import app from '../../src/app'
import { App } from 'supertest/types'
import { isJwt } from '../utils'

describe('POST /auth/login', () => {
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
    it('should return 200 status code', async () => {
      // Arrange
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: '9B9yZ@example.com',
        password: 'password123',
      }

      // Act
      await request(app as unknown as App)
        .post('/auth/register')
        .send(userData)
      const response = await request(app as unknown as App)
        .post('/auth/login')
        .send(userData)

      // Assert
      expect(response.statusCode).toBe(200)
    })

    it('should return valid json response', async () => {
      // Arrange
      const userData = {
        email: '9B9yZ@example.com',
        password: 'password123',
      }

      // Act
      const response = await request(app as unknown as App)
        .post('/auth/login')
        .send(userData)

      // Assert
      expect(
        (response.headers as Record<string, string>)['content-type'],
      ).toEqual(expect.stringContaining('json'))
    })

    it('should return 400 status code if email or password is wrong', async () => {
      // Arrange
      const userData = {
        email: '9B9yZ@example.com',
        password: 'password123',
      }

      // Act
      const response = await request(app as unknown as App)
        .post('/auth/login')
        .send(userData)

      // Assert
      expect(response.statusCode).toBe(400)
    })

    it('should return refresh token and access token in cookie', async () => {
      // Arrange
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: '9B9yZ@example.com',
        password: 'password123',
      }

      // Act
      await request(app as unknown as App)
        .post('/auth/register')
        .send(userData)
      const response = await request(app as unknown as App)
        .post('/auth/login')
        .send(userData)

      // Assert
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
  })
  describe('Fields are missing', () => {
    it('should return 400 status code if email field is missing', async () => {
      // Arrange
      const userData = {
        email: '',
        password: 'password123',
      }

      // Act
      const response = await request(app as unknown as App)
        .post('/auth/login')
        .send(userData)

      // Assert
      expect(response.statusCode).toBe(400)
    })

    it('should return 400 status code if password field is missing', async () => {
      // Arrange
      const userData = {
        email: 'example.com',
        password: '',
      }

      // Act
      const response = await request(app as unknown as App)
        .post('/auth/login')
        .send(userData)

      // Assert
      expect(response.statusCode).toBe(400)
    })
  })
})
