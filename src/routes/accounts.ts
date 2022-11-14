import express from 'express'
import { asyncRoute } from './async-route'
import { validateSchema, validateZodSchema } from '../schema/'
import {
  DeleteFiatAccountRequestParams,
  NotImplementedError,
  PostFiatAccountRequestBody,
} from '../types'
import { siweAuthMiddleware } from '../middleware/authenticate'
import { postFiatAccountRequestBodySchema } from '@fiatconnect/fiatconnect-types'

export function accountsRouter({
  clientAuthMiddleware,
}: {
  clientAuthMiddleware: express.RequestHandler[]
}): express.Router {
  const router = express.Router()

  router.use(siweAuthMiddleware)
  router.use(clientAuthMiddleware)

  const postFiatAccountRequestBodyValidator = (
    req: express.Request<{}, {}, PostFiatAccountRequestBody>,
    _res: express.Response,
    next: express.NextFunction,
  ) => {
    validateZodSchema(req.body, postFiatAccountRequestBodySchema)
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
        _req: express.Request<{}, {}, PostFiatAccountRequestBody>,
        _res: express.Response,
      ) => {
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
