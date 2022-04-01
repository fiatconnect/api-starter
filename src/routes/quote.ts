import express from 'express'
import { asyncRoute } from './async-route'
import { validateSchema } from '../schema/'
import { QuoteRequestQuery, JwtAuthorizationMiddleware } from '../types'
import { providerResponses } from '../mocks/providerResponses/index'
import extractProvider from '../middleware/extractProvider'

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
    extractProvider,
    asyncRoute(
      async (
        _req: express.Request<{}, {}, {}, QuoteRequestQuery>,
        _res: express.Response,
      ) => {
        const providerResponse = providerResponses[_res.locals.provider]

        _res.status(200).json(providerResponse.quoteIn)
      },
    ),
  )

  router.get(
    '/out',
    extractProvider,
    asyncRoute(
      async (
        _req: express.Request<{}, {}, {}, QuoteRequestQuery>,
        _res: express.Response,
      ) => {
        const providerResponse = providerResponses[_res.locals.provider]

        _res.status(200).json(providerResponse.quoteOut)
      },
    ),
  )

  return router
}
