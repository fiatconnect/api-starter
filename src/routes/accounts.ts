import express from 'express'
import { asyncRoute } from './async-route'
import { validateSchema } from '../schema/'
import {
  AddFiatAccountRequestParams,
  DeleteFiatAccountRequestParams,
  FiatAccountSchema,
  AccountNumber,
  NotImplementedError,
  JwtAuthorizationMiddleware,
} from '../types'

export function accountsRouter({
  jwtAuthMiddleware,
  clientAuthMiddleware,
}: {
  jwtAuthMiddleware: JwtAuthorizationMiddleware
  clientAuthMiddleware: express.RequestHandler[]
}): express.Router {
  const router = express.Router()

  router.use(jwtAuthMiddleware.expirationRequired)
  router.use(clientAuthMiddleware)

  const addFiatAccountRequestParamsValidator = (
    req: express.Request,
    _res: express.Response,
    next: express.NextFunction,
  ) => {
    req.params = validateSchema<AddFiatAccountRequestParams>(
      req.params,
      'AddFiatAccountRequestParamsSchema',
    )
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
    '/:fiatAccountSchema',
    addFiatAccountRequestParamsValidator,
    asyncRoute(
      async (
        req: express.Request<AddFiatAccountRequestParams>,
        _res: express.Response,
      ) => {
        // Delegate to type-specific handlers after validation provides type guards
        switch (req.params.fiatAccountSchema) {
          case FiatAccountSchema.AccountNumber:
            validateSchema<AccountNumber>(req.body, 'AccountNumberSchema')
          default:
            throw new Error(
              `Non-existent fiat account schema "${req.params.fiatAccountSchema}"`,
            )
        }

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
