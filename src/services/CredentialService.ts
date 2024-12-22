import bcrypt from 'bcrypt'

export class CredentialService {
  async checkPassword(userPassword: string, hashedPassword: string) {
    return await bcrypt.compare(userPassword, hashedPassword)
  }
}
