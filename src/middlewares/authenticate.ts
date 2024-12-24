import jwksClient, { GetVerificationKey } from 'jwks-rsa'
import { Request } from 'express'
import { expressjwt } from 'express-jwt'
import { Config } from '../config'

export default expressjwt({
  secret: jwksClient.expressJwtSecret({
    // URI where we will host our public key for RSA256
    jwksUri: Config.JWKS_URI!,
    cache: true,
    rateLimit: true,
  }) as GetVerificationKey,
  algorithms: ['RS256'],

  // Need to override logic of gettoken as default it expect to present token in header but we sent it in cookie
  getToken(req: Request) {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.split(' ')[1] !== 'undefined') {
      const token = authHeader.split(' ')[1]
      if (token) return token
    }
    const { accessToken } = req.cookies as Record<string, string>
    return accessToken
  },
})
