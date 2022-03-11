import { Express } from 'express-serve-static-core'
import { JwtPayload } from 'jwt-decode'

declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtPayload | undefined
  }
}
