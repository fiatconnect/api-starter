import express from 'express'
import { asyncRoute } from './async-route'
import { validateSchema } from '../schema/'
import {
  AddFiatAccountRequestParams,
  DeleteFiatAccountRequestParams,
  FiatAccountSchema,
  MockCheckingAccount,
  JwtAuthorizationMiddleware,
} from '../types'
import { providerResponses } from '../mocks/providerResponses'
import extractProvider from '../middleware/extractProvider'

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
    extractProvider,
    asyncRoute(
      async (
        req: express.Request<AddFiatAccountRequestParams>,
        _res: express.Response,
      ) => {
        // Delegate to type-specific handlers after validation provides type guards
        switch (req.params.fiatAccountSchema) {
          case FiatAccountSchema.MockCheckingAccount:
            validateSchema<MockCheckingAccount>(
              req.body,
              'MockCheckingAccountSchema',
            )

            break
          default:
            throw new Error(
              `Non-existent fiat account schema "${req.params.fiatAccountSchema}"`,
            )
        }

        const providerResponse = providerResponses[_res.locals.provider]
        _res.status(200).json(providerResponse.postAccountSchema)
      },
    ),
  )

  router.get(
    '/',
    extractProvider,
    asyncRoute(async (_req: express.Request, _res: express.Response) => {
      const providerResponse = providerResponses[_res.locals.provider]
      _res.status(200).json(providerResponse.getAccounts)
    }),
  )

  router.delete(
    '/:fiatAccountId',
    deleteFiatAccountRequestParamsValidator,
    extractProvider,
    asyncRoute(
      async (
        _req: express.Request<DeleteFiatAccountRequestParams>,
        _res: express.Response,
      ) => {
        _res.status(200).send()
      },
    ),
  )
  return router
}
