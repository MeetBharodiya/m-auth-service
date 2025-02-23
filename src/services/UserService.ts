import { Repository } from 'typeorm'
import { User } from '../entity/User'
import { UserData } from '../types'
import createHttpError from 'http-errors'
import { Logger } from 'winston'
import bcrypt from 'bcrypt'

export class UserService {
  constructor(
    private userRepository: Repository<User>,
    private logger: Logger,
  ) {}
  async create({
    firstName,
    lastName,
    email,
    password,
    role,
    tenantId,
  }: UserData) {
    this.logger.debug('Creating user in database', {
      firstName,
      lastName,
      email,
      role,
      tenantId,
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
        role,
        tenant: tenantId ? { id: tenantId } : undefined,
      })
       
    } catch (err) {
      console.log('err', err)

      const error = createHttpError(500, 'Failed to store data in database')
      throw error
    }
  }

  async getAll() {
    return await this.userRepository.find()
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOne({ where: { email: email } })
  }

  async findById(id: number) {
    return await this.userRepository.findOne({ where: { id: id } })
  }

  async update(id: number, user: Partial<UserData>) {
    if ('tenantId' in user) {
      const tenant = user.tenantId ? { id: user.tenantId } : undefined
      delete user.tenantId
      user = { ...user, tenant } as Partial<UserData>
    }
    return await this.userRepository.update({ id: id }, user)
  }

  async delete(id: number) {
    return await this.userRepository.delete({ id: id })
  }
}
