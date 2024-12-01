import request from 'supertest'
import app from '../../src/app'

describe('POST /auth/register', () => {
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
      const response = await request(app).post('/auth/register').send(userData)

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
      const response = await request(app).post('/auth/register').send(userData)

      //Assert application/json
      expect(
        (response.headers as Record<string, string>)['content-type'],
      ).toEqual(expect.stringContaining('json'))
    })
  })
  describe('Fields are missing', () => {})
})
