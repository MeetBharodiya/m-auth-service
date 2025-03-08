import { JwtPayload, sign } from 'jsonwebtoken'
import { Config } from '../config'
import createHttpError from 'http-errors'
import { RefreshToken } from '../entity/RefreshToken'
import { User } from '../entity/User'
import { Logger } from 'winston'
import { Repository } from 'typeorm'

export class TokenService {
  constructor(
    private refreshTokenRepository: Repository<RefreshToken>,
    private logger: Logger,
  ) {}
  generateAccessToken(payload: JwtPayload) {
    let privatKey: string
    if (!Config.PRIVAT_KEY) {
      const error = createHttpError(500, 'Private key not found')
      throw error
    }
    try {
      privatKey = Config.PRIVAT_KEY
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      const error = createHttpError(500, 'Error while reading private key')
      throw error
    }

    const accesssToken = sign(payload, privatKey, {
      algorithm: 'RS256', // Need pair of keys to sign and verify the token
      expiresIn: Config.ACCESS_TOKEN_EXPIRES_IN,
      issuer: 'auth-service',
    })
    this.logger.debug('Generated access token', { accessToken: accesssToken })
    return accesssToken
  }

  generateRefreshToken(payload: JwtPayload) {
    // meaning of ! is we are sure that REFRESH_TOKEN_SECRET will never be undefined
    const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
      algorithm: 'HS256',
      expiresIn: Config.REFRESH_TOKEN_EXPIRES_IN,
      issuer: 'auth-service',
      jwtid: String(payload.id),
    })
    this.logger.debug('Generated refresh token', { refreshToken })
    return refreshToken
  }

  async persistRefreshToken(user: User) {
    const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365
    const newRefreshToken = await this.refreshTokenRepository.save({
      user: user,
      expiresAt: new Date(Date.now() + MS_IN_YEAR),
    })
    this.logger.debug('Refresh token saved in database')
    return newRefreshToken
  }

  async deleteRefreshToken(tokenId: number) {
    await this.refreshTokenRepository.delete({ id: tokenId })
  }
}
