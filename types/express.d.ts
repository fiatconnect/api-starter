import { Express } from 'express-serve-static-core'
import { JwtPayload } from 'jwt-decode'
import { SiweMessage } from 'siwe'

declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtPayload | undefined
  }
}


declare module 'express-session' {
  interface SessionData {
    siwe: SiweMessage | null
  }
}
