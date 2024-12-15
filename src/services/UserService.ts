import { Repository } from 'typeorm'
import { User } from '../entity/User'
import { UserData } from '../types'
import createHttpError from 'http-errors'
import { Logger } from 'winston'
import { Roles } from '../constants'
import bcrypt from 'bcrypt'

export class UserService {
  constructor(
    private userRepository: Repository<User>,
    private logger: Logger,
  ) {}
  async create({ firstName, lastName, email, password }: UserData) {
    this.logger.debug('Creating user in database', {
      firstName,
      lastName,
      email,
    })
    // check if email already exists
    const user = await this.userRepository.findOne({ where: { email: email } })
    if (user) {
      const err = createHttpError(400, 'Email already exists')
      throw err
    }
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    try {
      return await this.userRepository.save({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: Roles.CUSTOMER,
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      const error = createHttpError(500, 'Failed to store data in database')
      throw error
    }
  }
}
