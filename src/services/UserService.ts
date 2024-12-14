import { Repository } from 'typeorm'
import { User } from '../entity/User'
import { UserData } from '../types'
import createHttpError from 'http-errors'
import { Logger } from 'winston'

export class UserService {
  constructor(
    private userRepository: Repository<User>,
    private logger: Logger,
  ) {}
  async create({ firstName, lastName, email, password }: UserData) {
    try {
      this.logger.debug('Creating user in database', {
        firstName,
        lastName,
        email,
      })
      return await this.userRepository.save({
        firstName,
        lastName,
        email,
        password,
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      const error = createHttpError(500, 'Failed to store data in database')
      throw error
    }
  }
}
