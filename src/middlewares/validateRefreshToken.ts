import { Request } from 'express'
import { expressjwt } from 'express-jwt'
import { Config } from '../config'
import { AuthCookie, IRefershToken } from '../types'
import { AppDataSource } from '../config/data-source'
import { RefreshToken } from '../entity/RefreshToken'
import logger from '../config/logger'

export default expressjwt({
  secret: Config.REFRESH_TOKEN_SECRET!,
  algorithms: ['HS256'],
  getToken(req: Request) {
    const { refreshToken } = req.cookies as AuthCookie
    return refreshToken
  },
  // Function to check if refresh token is revoked or not because we are deleting refresh token when user is hitting logout by themselves
  async isRevoked(req: Request, token) {
    try {
      const refreshTokenRepo = AppDataSource.getRepository(RefreshToken)
      const refreshToeken = await refreshTokenRepo.findOne({
        where: {
          id: Number((token?.payload as IRefershToken).id),
          user: {
            id: Number(token?.payload.sub),
          },
        },
      })
      return refreshToeken === null
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      logger.error('Error while checking refresh token in database', {
        id: (token?.payload as IRefershToken).id,
      })
      return true
    }
  },
})
