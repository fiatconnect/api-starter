import express from 'express'
import { asyncRoute } from './async-route'
import { validateZodSchema } from '../schema/'
import {
  FiatConnectError,
  KycRequestParams,
  KycSchemas,
  NotImplementedError,
  SupportedKycSchemas,
} from '../types'
import { siweAuthMiddleware } from '../middleware/authenticate'
import {
  kycRequestParamsSchema,
  KycSchema,
  personalDataAndDocumentsKycSchema,
  personalDataAndDocumentsDetailedKycSchema,
} from '@fiatconnect/fiatconnect-types'
import { ZodTypeAny } from 'zod'

const kycSchemaToZodSchema: { [kycSchema in KycSchema]: ZodTypeAny } = {
  // if a KYC schema is missing, that should be evident at compile-time, as long as fiatconnect-types is up to date
  [KycSchema.PersonalDataAndDocuments]: personalDataAndDocumentsKycSchema,
  [KycSchema.PersonalDataAndDocumentsDetailed]:
    personalDataAndDocumentsDetailedKycSchema,
}

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
    req.params = validateZodSchema(
      req.params,
      kycRequestParamsSchema,
      FiatConnectError.InvalidSchema,
    )
    next()
  }

  router.post(
    '/:kycSchema',
    kycSchemaRequestParamsValidator,
    asyncRoute(
      async (
        req: express.Request<
          KycRequestParams,
          {},
          KycSchemas[SupportedKycSchemas]
        >,
        _res: express.Response,
      ) => {
        // Delegate to type-specific handlers after validation provides type guards
        validateZodSchema(req.body, kycSchemaToZodSchema[req.params.kycSchema])

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
