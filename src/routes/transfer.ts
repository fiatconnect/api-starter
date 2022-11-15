import express from 'express'
import { asyncRoute } from './async-route'
import { validateZodSchema } from '../schema/'
import {
  TransferRequestBody,
  TransferStatusRequestParams,
  NotImplementedError,
} from '../types'
import { siweAuthMiddleware } from '../middleware/authenticate'
import {
  transferRequestBodySchema,
  transferStatusRequestParamsSchema,
} from '@fiatconnect/fiatconnect-types'

export function transferRouter({
  clientAuthMiddleware,
}: {
  clientAuthMiddleware: express.RequestHandler[]
}): express.Router {
  const router = express.Router()

  router.use(siweAuthMiddleware)
  router.use(clientAuthMiddleware)

  const transferRequestBodyValidator = (
    req: express.Request,
    _res: express.Response,
    next: express.NextFunction,
  ) => {
    req.body = validateZodSchema(req.body, transferRequestBodySchema)
    next()
  }

  const transferStatusRequestParamsValidator = (
    req: express.Request,
    _res: express.Response,
    next: express.NextFunction,
  ) => {
    req.params = validateZodSchema(
      req.params,
      transferStatusRequestParamsSchema,
    )
    next()
  }

  router.post(
    '/in',
    transferRequestBodyValidator,
    asyncRoute(
      async (
        _req: express.Request<{}, {}, TransferRequestBody>,
        _res: express.Response,
      ) => {
        throw new NotImplementedError('POST /transfer/in not implemented')
      },
    ),
  )

  router.post(
    '/out',
    transferRequestBodyValidator,
    asyncRoute(
      async (
        _req: express.Request<{}, {}, TransferRequestBody>,
        _res: express.Response,
      ) => {
        throw new NotImplementedError('POST /transfer/out not implemented')
      },
    ),
  )

  router.get(
    '/:transferId/status',
    transferStatusRequestParamsValidator,
    asyncRoute(
      async (
        _req: express.Request<TransferStatusRequestParams>,
        _res: express.Response,
      ) => {
        throw new NotImplementedError(
          'GET /transfer/:transferId/status not implemented',
        )
      },
    ),
  )

  return router
}
