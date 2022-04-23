import express from 'express'
import { ErrorTypes, SiweMessage } from 'siwe'
import { validateSchema } from '../schema'
import {
  AuthRequestBody,
  InvalidSiweParamsError,
  NotImplementedError,
} from '../types'
import { asyncRoute } from './async-route'

const MAX_EXPIRATION_TIME_MS = 4 * 60 * 60 * 1000 // 4 hours
const VERSION = '1'
const CHAIN_ID = 42220

function validateNonce(_nonce: string) {
  throw new NotImplementedError('Nonce validation not implemented')
}

function validateIssuedAtAndExpirationTime(
  issuedAt: string,
  expirationTime?: string,
) {
  if (!expirationTime) {
    throw new InvalidSiweParamsError('Missing ExpirationTime')
  }
  const issuedAtDate = new Date(issuedAt)
  const expirationDate = new Date(expirationTime)
  const now = new Date()
  if (issuedAtDate > now) {
    throw new InvalidSiweParamsError('IssuedAt date is in the future')
  }
  if (expirationDate < now) {
    throw new InvalidSiweParamsError('ExpirationTime is in the past')
  }
  if (expirationDate < issuedAtDate) {
    throw new InvalidSiweParamsError('ExpirationTime is before IssuedAt')
  }
  if (
    expirationDate.getTime() - issuedAtDate.getTime() >
    MAX_EXPIRATION_TIME_MS
  ) {
    throw new InvalidSiweParamsError('ExpirationTime too long')
  }
}

function validateDomainAndUri(_domain: string, _uri: string) {
  throw new NotImplementedError('Domain and URI validation not implemented')
}

export function authRouter(): express.Router {
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
          console.warn(err)
          const errMessage = (err as Error).message
          if (errMessage.startsWith(ErrorTypes.INVALID_SIGNATURE)) {
            throw new InvalidSiweParamsError('Invalid signature')
          } else if (errMessage.startsWith(ErrorTypes.EXPIRED_MESSAGE)) {
            throw new InvalidSiweParamsError('Expired siwe message')
          }
          throw new InvalidSiweParamsError('Invalid siwe message')
        }

        validateIssuedAtAndExpirationTime(
          siweFields.issuedAt,
          siweFields.expirationTime,
        )
        validateNonce(siweFields.nonce)
        validateDomainAndUri(siweFields.domain, siweFields.uri)

        if (siweFields.version !== VERSION) {
          throw new InvalidSiweParamsError('Invalid version')
        }

        if (siweFields.chainId !== CHAIN_ID) {
          throw new InvalidSiweParamsError('Invalid chain ID')
        }

        req.session.siwe = siweFields
        req.session.cookie.expires = new Date(siweFields.expirationTime!)
        res.status(200).end()
      },
    ),
  )

  return router
}
