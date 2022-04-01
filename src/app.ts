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

  app.use(
    '/:providerName?/quote',
    quoteRouter({ jwtAuthMiddleware, clientAuthMiddleware }),
  )
  app.use(
    '/:providerName?/kyc',
    kycRouter({ jwtAuthMiddleware, clientAuthMiddleware }),
  )
  app.use(
    '/:providerName?/accounts',
    accountsRouter({ jwtAuthMiddleware, clientAuthMiddleware }),
  )
  app.use(
    '/:providerName?/transfer',
    transferRouter({ jwtAuthMiddleware, clientAuthMiddleware }),
  )

  app.use(errorToStatusCode)

  return app
}
