import express from 'express'
import { asyncRoute } from './async-route'
import { validateSchema } from '../schema/'
import {
  KycRequestParams,
  KycSchema,
  PersonalDataAndDocumentsKyc,
  JwtAuthorizationMiddleware,
} from '../types'
import { providerResponses } from '../mocks/providerResponses'
import extractProvider from '../middleware/extractProvider'

export function kycRouter({
  jwtAuthMiddleware,
  clientAuthMiddleware,
}: {
  jwtAuthMiddleware: JwtAuthorizationMiddleware
  clientAuthMiddleware: express.RequestHandler[]
}): express.Router {
  const router = express.Router()

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
    jwtAuthMiddleware.expirationRequired,
    clientAuthMiddleware,
    kycSchemaRequestParamsValidator,
    extractProvider,
    asyncRoute(
      async (
        req: express.Request<KycRequestParams>,
        _res: express.Response,
      ) => {
        // Delegate to type-specific handlers after validation provides type guards
        switch (req.params.kycSchema) {
          case KycSchema.PersonalDataAndDocuments:
            validateSchema<PersonalDataAndDocumentsKyc>(
              req.body,
              'PersonalDataAndDocumentsKycSchema',
            )

            break
          default:
            throw new Error(`Non-existent KYC schema "${req.params.kycSchema}"`)
        }

        const providerResponse = providerResponses[_res.locals.provider]
        _res.status(200).json(providerResponse.postKycData)
      },
    ),
  )

  router.get(
    '/:kycSchema/status',
    jwtAuthMiddleware.expirationOptional,
    clientAuthMiddleware,
    kycSchemaRequestParamsValidator,
    extractProvider,
    asyncRoute(
      async (
        _req: express.Request<KycRequestParams>,
        _res: express.Response,
      ) => {
        const providerResponse = providerResponses[_res.locals.provider]

        _res.status(200).json(providerResponse.getKycStatus)
      },
    ),
  )

  router.delete(
    '/:kycSchema',
    jwtAuthMiddleware.expirationRequired,
    clientAuthMiddleware,
    kycSchemaRequestParamsValidator,
    extractProvider,
    asyncRoute(
      async (
        _req: express.Request<KycRequestParams>,
        _res: express.Response,
      ) => {
        _res.status(200).send()
      },
    ),
  )

  return router
}
