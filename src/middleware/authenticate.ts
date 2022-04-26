import { UnauthorizedError } from '../types'
import express from 'express'
import {
  AuthenticationConfig,
  ClientAuthStrategy,
} from '../types'
import { FiatConnectError } from '@fiatconnect/fiatconnect-types'

function doNothingMiddleware(
  _req: express.Request,
  _res: express.Response,
  next: express.NextFunction,
) {
  next()
}

function verifyClientKeyMiddleware(
  _req: express.Request,
  _res: express.Response,
  _next: express.NextFunction,
) {
  // could be something like `if (req.user.apiKey !== EXPECTED_API_KEY) throw new UnauthorizedError('Invalid api key'); next();
  throw new Error('verifyClientKeyMiddleware not implemented')
}

export function getClientAuthMiddleware(
  authConfig: AuthenticationConfig,
): express.RequestHandler[] {
  switch (authConfig.clientAuthStrategy) {
    case ClientAuthStrategy.Optional:
      // Checks the JWT for a client key, but does not require one; if present, validates that it's a recognized key.
      return [doNothingMiddleware]
    case ClientAuthStrategy.Required:
      // Requires that the JWT contain a recognized client key.
      return [verifyClientKeyMiddleware]
    default:
      throw new Error(
        `Auth strategy does not have a handler defined: ${authConfig.clientAuthStrategy}`,
      )
  }
}

export function siweAuthMiddleware(
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction,
) {
  if (!req.session.siwe) {
    throw new UnauthorizedError()
  }
  if (new Date() > new Date(req.session.siwe.expirationTime!)) {
    throw new UnauthorizedError(FiatConnectError.SessionExpired)
  }
  next()
}
