import express from 'express'
import Session from 'express-session'
import { quoteRouter } from './routes/quote'
import { kycRouter } from './routes/kyc'
import { accountsRouter } from './routes/accounts'
import { transferRouter } from './routes/transfer'
import { errorToStatusCode } from './middleware/error'
import { authRouter } from './routes/auth'

// this is typically the name of the provider
const SESSION_NAME = 'api-starter'

// a secret for signing the session token, typically loaded via env vars and not
// stored in the codebase. See
// https://www.npmjs.com/package/express-session-expire-timeout#secret for more
// details.
const SESSION_SECRET = process.env.SESSION_SECRET || 'api-starter-secret'

export function initApp({
  clientAuthMiddleware,
}: {
  clientAuthMiddleware: express.RequestHandler[]
}): express.Application {
  const app = express()

  app.use(express.json())
  app.use(
    // https://www.npmjs.com/package/express-session-expire-timeout#sessionoptions
    Session({
      name: SESSION_NAME,
      secret: SESSION_SECRET,
      resave: true,
      saveUninitialized: true,
      cookie: { secure: false, sameSite: true },
    }),
  )

  app.use('/auth', authRouter())

  app.use('/quote', quoteRouter({ clientAuthMiddleware }))
  app.use('/kyc', kycRouter({ clientAuthMiddleware }))
  app.use('/accounts', accountsRouter({ clientAuthMiddleware }))
  app.use('/transfer', transferRouter({ clientAuthMiddleware }))

  app.use(errorToStatusCode)

  return app
}
