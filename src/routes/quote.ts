import express from 'express'
import { asyncRoute } from './async-route'
import { validateZodSchema } from '../schema/'
import { QuoteRequestBody, NotImplementedError } from '../types'
import { quoteRequestBodySchema } from '@fiatconnect/fiatconnect-types'

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
      req.body = validateZodSchema(req.body, quoteRequestBodySchema)
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
