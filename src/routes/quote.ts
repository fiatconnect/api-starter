import express from 'express'
import { asyncRoute } from './async-route'
import { validateSchema } from '../schema/'
import { QuoteRequestBody, NotImplementedError } from '../types'

export function quoteRouter({
  clientAuthMiddleware,
}: {
  clientAuthMiddleware: express.RequestHandler[]
}): express.Router {
  const router = express.Router()

  router.use(clientAuthMiddleware)

  router.use(
    (
      req: express.Request,
      _res: express.Response,
      next: express.NextFunction,
    ) => {
      req.query = validateSchema<QuoteRequestBody>(
        req.query,
        'QuoteRequestBodySchema',
      )
      next()
    },
  )

  router.post(
    '/in',
    asyncRoute(
      async (
        _req: express.Request<{}, {}, QuoteRequestBody>,
        _res: express.Response,
      ) => {
        throw new NotImplementedError('POST /quote/in not implemented')
      },
    ),
  )

  router.post(
    '/out',
    asyncRoute(
      async (
        _req: express.Request<{}, {}, QuoteRequestBody>,
        _res: express.Response,
      ) => {
        throw new NotImplementedError('POST /quote/out not implemented')
      },
    ),
  )

  return router
}
