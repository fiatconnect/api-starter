import express from 'express'
import Session from 'express-session'
import { quoteRouter } from './routes/quote'
import { kycRouter } from './routes/kyc'
import { accountsRouter } from './routes/accounts'
import { transferRouter } from './routes/transfer'
import { errorToStatusCode } from './middleware/error'
import { authRouter } from './routes/auth'
import { NotImplementedError } from './types'

function getSessionName(): string {
  // must return a name for the session cookie, typically the provider name
  throw new NotImplementedError('getSessionName not implemented')
}

export function initApp({
  clientAuthMiddleware,
  sessionSecret,
  chainId,
}: {
  clientAuthMiddleware: express.RequestHandler[]
  sessionSecret: string
  chainId: number
}): express.Application {
  const app = express()

  app.use(express.json())
  app.use(
    // https://www.npmjs.com/package/express-session-expire-timeout#sessionoptions
    Session({
      name: getSessionName(),
      secret: sessionSecret,
      resave: true,
      saveUninitialized: true,
      cookie: { secure: true, sameSite: true },
    }),
  )

  app.use('/auth', authRouter({ chainId }))

  app.use('/quote', quoteRouter({ clientAuthMiddleware }))
  app.use('/kyc', kycRouter({ clientAuthMiddleware }))
  app.use('/accounts', accountsRouter({ clientAuthMiddleware }))
  app.use('/transfer', transferRouter({ clientAuthMiddleware }))

  app.use(errorToStatusCode)

  return app
}
