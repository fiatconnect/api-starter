import express from 'express'
import { ErrorTypes, SiweMessage } from 'siwe'
import { validateSchema } from '../schema'
import {
  AuthRequestBody,
  FiatConnectError,
  InvalidSiweParamsError,
  NotImplementedError,
} from '../types'
import { asyncRoute } from './async-route'

const MAX_EXPIRATION_TIME_MS = 4 * 60 * 60 * 1000 // 4 hours
const VERSION = '1'

function validateNonce(_nonce: string) {
  // must validate that the nonce hasn't already been used. Could typically be
  // done by saving nonces in a store with TTL (like redis) and check if the
  // nonce is already used. If a nonce is already used, must throw a NonceInUse
  // error. e.g. `throw new InvalidSiweParamsError(FiatConnectError.NonceInUser)`
  throw new NotImplementedError('Nonce validation not implemented')
}

function markNonceAsUsed(_nonce: string, _expirationTime: Date) {
  // helper method for storing nonces, which can then be used by the above method.
  throw new NotImplementedError('markNonceAsUsed not implemented')
}

function validateIssuedAtAndExpirationTime(
  issuedAt: string,
  expirationTime?: string,
) {
  if (!expirationTime) {
    throw new InvalidSiweParamsError(
      FiatConnectError.InvalidParameters,
      'Missing ExpirationTime',
    )
  }
  const issuedAtDate = new Date(issuedAt)
  const expirationDate = new Date(expirationTime)
  const now = new Date()
  if (issuedAtDate > now) {
    throw new InvalidSiweParamsError(FiatConnectError.IssuedTooEarly)
  }
  if (expirationDate < now) {
    throw new InvalidSiweParamsError(
      FiatConnectError.InvalidParameters,
      'ExpirationTime is in the past',
    )
  }
  if (expirationDate < issuedAtDate) {
    throw new InvalidSiweParamsError(
      FiatConnectError.InvalidParameters,
      'ExpirationTime is before IssuedAt',
    )
  }
  if (
    expirationDate.getTime() - issuedAtDate.getTime() >
    MAX_EXPIRATION_TIME_MS
  ) {
    throw new InvalidSiweParamsError(FiatConnectError.ExpirationTooLong)
  }
}

function validateDomainAndUri(_domain: string, _uri: string) {
  throw new NotImplementedError('Domain and URI validation not implemented')
}

export function authRouter({ chainId }: { chainId: number }): express.Router {
  const router = express.Router()

  const authRequestBodyValidator = (
    req: express.Request,
    _res: express.Response,
    next: express.NextFunction,
  ) => {
    req.body = validateSchema<AuthRequestBody>(
      req.body,
      'AuthRequestBodySchema',
    )
    next()
  }

  router.post(
    '/login',
    authRequestBodyValidator,
    asyncRoute(
      async (
        req: express.Request<{}, {}, AuthRequestBody>,
        res: express.Response,
      ) => {
        let siweFields: SiweMessage

        try {
          const siweMessage = new SiweMessage(req.body.message)
          siweFields = await siweMessage.validate(req.body.signature)
        } catch (err) {
          const errMessage = (err as Error).message
          if (errMessage.includes(ErrorTypes.INVALID_SIGNATURE)) {
            throw new InvalidSiweParamsError(FiatConnectError.InvalidSignature)
          } else if (errMessage.includes(ErrorTypes.EXPIRED_MESSAGE)) {
            throw new InvalidSiweParamsError(
              FiatConnectError.InvalidParameters,
              'Expired message',
            )
          }
          throw new InvalidSiweParamsError(
            FiatConnectError.InvalidParameters,
            'Invalid siwe message',
          )
        }

        validateIssuedAtAndExpirationTime(
          siweFields.issuedAt,
          siweFields.expirationTime,
        )
        validateNonce(siweFields.nonce)
        validateDomainAndUri(siweFields.domain, siweFields.uri)

        if (siweFields.version !== VERSION) {
          throw new InvalidSiweParamsError(
            FiatConnectError.InvalidParameters,
            'Invalid version',
          )
        }

        if (siweFields.chainId !== chainId) {
          throw new InvalidSiweParamsError(
            FiatConnectError.InvalidParameters,
            'Invalid chain ID',
          )
        }

        const sessionExpirationTime = new Date(siweFields.expirationTime!)
        markNonceAsUsed(siweFields.nonce, sessionExpirationTime)

        req.session.siwe = siweFields
        req.session.cookie.expires = sessionExpirationTime
        res.status(200).end()
      },
    ),
  )

  return router
}
