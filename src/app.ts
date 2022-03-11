import express from 'express'
import { JwtAuthorizationMiddleware } from './types'
import { quoteRouter } from './routes/quote'
import { kycRouter } from './routes/kyc'
import { accountsRouter } from './routes/accounts'
import { transferRouter } from './routes/transfer'
import { errorToStatusCode } from './middleware/error'

export function initApp({
  jwtAuthMiddleware,
  clientAuthMiddleware,
}: {
  jwtAuthMiddleware: JwtAuthorizationMiddleware
  clientAuthMiddleware: express.RequestHandler[]
}): express.Application {
  const app = express()

  app.use(express.json())

  app.use('/quote', quoteRouter({ jwtAuthMiddleware, clientAuthMiddleware }))
  app.use('/kyc', kycRouter({ jwtAuthMiddleware, clientAuthMiddleware }))
  app.use(
    '/accounts',
    accountsRouter({ jwtAuthMiddleware, clientAuthMiddleware }),
  )
  app.use(
    '/transfer',
    transferRouter({ jwtAuthMiddleware, clientAuthMiddleware }),
  )

  app.use(errorToStatusCode)

  return app
}
