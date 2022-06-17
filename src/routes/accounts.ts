import express from 'express'
import { asyncRoute } from './async-route'
import { validateSchema } from '../schema/'
import {
  DeleteFiatAccountRequestParams,
  NotImplementedError,
  SupportedFiatAccountSchemas,
} from '../types'
import { siweAuthMiddleware } from '../middleware/authenticate'
import { PostFiatAccountRequestBody } from '@fiatconnect/fiatconnect-types'

export function accountsRouter({
  clientAuthMiddleware,
}: {
  clientAuthMiddleware: express.RequestHandler[]
}): express.Router {
  const router = express.Router()

  router.use(siweAuthMiddleware)
  router.use(clientAuthMiddleware)

  const postFiatAccountRequestBodyValidator = (
    req: express.Request<
      {},
      {},
      PostFiatAccountRequestBody<SupportedFiatAccountSchemas>
    >,
    _res: express.Response,
    next: express.NextFunction,
  ) => {
    req.body = validateSchema<
      PostFiatAccountRequestBody<SupportedFiatAccountSchemas>
    >(req.body, 'PostFiatAccountRequestParamsSchema')
    next()
  }

  const deleteFiatAccountRequestParamsValidator = (
    req: express.Request,
    _res: express.Response,
    next: express.NextFunction,
  ) => {
    req.params = validateSchema<DeleteFiatAccountRequestParams>(
      req.params,
      'DeleteFiatAccountRequestParamsSchema',
    )
    next()
  }

  router.post(
    '/',
    postFiatAccountRequestBodyValidator,
    asyncRoute(
      async (
        req: express.Request<
          {},
          {},
          PostFiatAccountRequestBody<SupportedFiatAccountSchemas>
        >,
        _res: express.Response,
      ) => {
        // Validate body for exact fiat account schema type. The body middleware
        // doesn't ensure exact match of fiatAccountSchema and data
        validateSchema<typeof req.body.fiatAccountSchema>(
          req.body.data,
          `${req.body.fiatAccountSchema}Schema`,
        )

        throw new NotImplementedError(
          'POST /accounts/:fiatAccountSchema not implemented',
        )
      },
    ),
  )

  router.get(
    '/',
    asyncRoute(async (_req: express.Request, _res: express.Response) => {
      throw new NotImplementedError('GET /accounts not implemented')
    }),
  )

  router.delete(
    '/:fiatAccountId',
    deleteFiatAccountRequestParamsValidator,
    asyncRoute(
      async (
        _req: express.Request<DeleteFiatAccountRequestParams>,
        _res: express.Response,
      ) => {
        throw new NotImplementedError(
          'DELETE /accounts/:fiatAccountId not implemented',
        )
      },
    ),
  )
  return router
}
