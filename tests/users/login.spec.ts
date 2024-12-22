import request from 'supertest'
import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import app from '../../src/app'
import { App } from 'supertest/types'

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
    // it('should return 200 status code', async () => {
    //   // Arrange
    //   const userData = {
    //     email: 'temp@gmail.com',
    //     password: 'password123',
    //   }

    //   // Act
    //   const response = await request(app as unknown as App)
    //     .post('/auth/login')
    //     .send(userData)
    //   console.log(response.body)

    //   // Assert
    //   expect(response.statusCode).toBe(200)
    // })

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

    it('should return 400 status code if email does not exist in database', async () => {
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

    it('should return 400 status code if password does not exist in database', async () => {
      // Arrange
      const userData = {
        email: '9B9yZ@example.com',
        password: 'password',
      }

      // Act
      const response = await request(app as unknown as App)
        .post('/auth/login')
        .send(userData)

      // Assert
      expect(response.statusCode).toBe(400)
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
