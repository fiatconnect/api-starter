import { SiweMessage } from 'siwe'

declare module 'express-session' {
  interface SessionData {
    siwe: SiweMessage | null
  }
}
