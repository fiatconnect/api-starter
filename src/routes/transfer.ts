import express from 'express'
import { asyncRoute } from './async-route'
import { validateSchema } from '../schema/'
import {
  TransferRequestBody,
  TransferStatusRequestParams,
  JwtAuthorizationMiddleware,
} from '../types'
import extractProvider from '../middleware/extractProvider'
import { providerResponses } from '../mocks/providerResponses'

export function transferRouter({
  jwtAuthMiddleware,
  clientAuthMiddleware,
}: {
  jwtAuthMiddleware: JwtAuthorizationMiddleware
  clientAuthMiddleware: express.RequestHandler[]
}): express.Router {
  const router = express.Router()

  const transferRequestBodyValidator = (
    req: express.Request,
    _res: express.Response,
    next: express.NextFunction,
  ) => {
    req.body = validateSchema<TransferRequestBody>(
      req.body,
      'TransferRequestBodySchema',
    )
    next()
  }

  const transferStatusRequestParamsValidator = (
    req: express.Request,
    _res: express.Response,
    next: express.NextFunction,
  ) => {
    req.params = validateSchema<TransferStatusRequestParams>(
      req.params,
      'TransferStatusRequestParamsSchema',
    )
    next()
  }

  router.post(
    '/in',
    jwtAuthMiddleware.expirationRequired,
    clientAuthMiddleware,
    transferRequestBodyValidator,
    extractProvider,
    asyncRoute(
      async (
        _req: express.Request<{}, {}, TransferRequestBody>,
        _res: express.Response,
      ) => {
        const providerResponse = providerResponses[_res.locals.provider]

        _res.status(200).json(providerResponse.postTransfer)
      },
    ),
  )

  router.post(
    '/out',
    jwtAuthMiddleware.expirationRequired,
    clientAuthMiddleware,
    transferRequestBodyValidator,
    extractProvider,
    asyncRoute(
      async (
        _req: express.Request<{}, {}, TransferRequestBody>,
        _res: express.Response,
      ) => {
        const providerResponse = providerResponses[_res.locals.provider]

        _res.status(200).json(providerResponse.postTransfer)
      },
    ),
  )

  router.get(
    '/:transferId/status',
    jwtAuthMiddleware.expirationOptional,
    clientAuthMiddleware,
    transferStatusRequestParamsValidator,
    extractProvider,
    asyncRoute(
      async (
        _req: express.Request<TransferStatusRequestParams>,
        _res: express.Response,
      ) => {
        const providerResponse = providerResponses[_res.locals.provider]

        _res.status(200).json(providerResponse.getTransferStatus)
      },
    ),
  )

  return router
}
