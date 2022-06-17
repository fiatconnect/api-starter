import express from 'express'
import { asyncRoute } from './async-route'
import { validateSchema } from '../schema/'
import {
  KycRequestParams,
  KycSchema,
  KycSchemas,
  NotImplementedError,
} from '../types'
import { siweAuthMiddleware } from '../middleware/authenticate'

export function kycRouter({
  clientAuthMiddleware,
}: {
  clientAuthMiddleware: express.RequestHandler[]
}): express.Router {
  const router = express.Router()

  router.use(siweAuthMiddleware)
  router.use(clientAuthMiddleware)

  const kycSchemaRequestParamsValidator = (
    req: express.Request,
    _res: express.Response,
    next: express.NextFunction,
  ) => {
    req.params = validateSchema<KycRequestParams>(
      req.params,
      'KycRequestParamsSchema',
    )
    next()
  }

  router.post(
    '/:kycSchema',
    kycSchemaRequestParamsValidator,
    asyncRoute(
      async (
        req: express.Request<KycRequestParams, {}, KycSchemas[KycSchema]>,
        _res: express.Response,
      ) => {
        // Delegate to type-specific handlers after validation provides type guards
        validateSchema<KycSchemas[typeof req.params.kycSchema]>(
          req.body,
          `${req.params.kycSchema}KycSchema`,
        )

        throw new NotImplementedError('POST /kyc/:kycSchema not implemented')
      },
    ),
  )

  router.get(
    '/:kycSchema/status',
    kycSchemaRequestParamsValidator,
    asyncRoute(
      async (
        _req: express.Request<KycRequestParams>,
        _res: express.Response,
      ) => {
        throw new NotImplementedError(
          'GET /kyc/:kycSchema/status not implemented',
        )
      },
    ),
  )

  router.delete(
    '/:kycSchema',
    kycSchemaRequestParamsValidator,
    asyncRoute(
      async (
        _req: express.Request<KycRequestParams>,
        _res: express.Response,
      ) => {
        throw new NotImplementedError('DELETE /kyc/:kycSchema not implemented')
      },
    ),
  )

  return router
}
