import express from 'express'
import {JwtAuthorizationMiddleware, NotImplementedError} from './types'
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

  app.get('/clock', (_req, _res) => {
    // NOTE: you *could* just use res.status(200).send({time: new Date().toISOFormat()}), BUT only if your server is single-node
    //  (otherwise you need session affinity or some way of guaranteeing consistency of the current time between nodes)
    throw new NotImplementedError()
  })

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
