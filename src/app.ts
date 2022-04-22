import express from 'express'
import Session from 'express-session'
import { quoteRouter } from './routes/quote'
import { kycRouter } from './routes/kyc'
import { accountsRouter } from './routes/accounts'
import { transferRouter } from './routes/transfer'
import { errorToStatusCode } from './middleware/error'
import { authRouter } from './routes/auth'

export function initApp({
  clientAuthMiddleware,
}: {
  clientAuthMiddleware: express.RequestHandler[]
}): express.Application {
  const app = express()

  app.use(express.json())
  app.use(
    Session({
      name: 'api-starter',
      secret: 'api-starter-secret',
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
