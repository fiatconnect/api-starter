import express from 'express'
import { asyncRoute } from './async-route'
import { validateSchema } from '../schema/'
import {
  QuoteRequestQuery,
  NotImplementedError,
  JwtAuthorizationMiddleware,
} from '../types'

export function quoteRouter({
  jwtAuthMiddleware,
  clientAuthMiddleware,
}: {
  jwtAuthMiddleware: JwtAuthorizationMiddleware
  clientAuthMiddleware: express.RequestHandler[]
}): express.Router {
  const router = express.Router()

  router.use(jwtAuthMiddleware.expirationOptional)
  router.use(clientAuthMiddleware)

  router.use(
    (
      req: express.Request,
      _res: express.Response,
      next: express.NextFunction,
    ) => {
      req.query = validateSchema<QuoteRequestQuery>(
        req.query,
        'QuoteRequestQuerySchema',
      )
      next()
    },
  )

  router.get(
    '/in',
    asyncRoute(
      async (
        _req: express.Request<{}, {}, {}, QuoteRequestQuery>,
        _res: express.Response,
      ) => {
        throw new NotImplementedError('GET /quote/in not implemented')
      },
    ),
  )

  router.get(
    '/out',
    asyncRoute(
      async (
        _req: express.Request<{}, {}, {}, QuoteRequestQuery>,
        _res: express.Response,
      ) => {
        throw new NotImplementedError('GET /quote/out not implemented')
      },
    ),
  )

  return router
}
