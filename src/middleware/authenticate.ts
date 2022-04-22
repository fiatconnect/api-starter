import { InvalidAuthParamsError, UnauthorizedError } from '../types'
import express from 'express'
import {
  AuthenticationConfig,
  JwtAuthStrategy,
  ClientAuthStrategy,
  JwtAuthorizationMiddleware,
} from '../types'
import jwt, { UnauthorizedError as JwtUnauthorizedError } from 'express-jwt'
import jwtDecode, { JwtPayload } from 'jwt-decode'
import { ethers } from 'ethers'
import KeyEncoder from 'key-encoder'
import { ensureLeading0x, trimLeading0x } from '@celo/utils/lib/address'

const keyEncoder = new KeyEncoder('secp256k1')
const EXP_MAX_AGE = 24 * 60 * 60 // Maximum age of a JWT `exp` claim. 24 hours.

export function getPublicKeyFromPayloadCallback(
  _req: express.Request,
  payload: JwtPayload,
  done: (err: Error | null, secret?: string) => any,
) {
  if (!payload.iss) {
    return done(
      new InvalidAuthParamsError(
        'Missing required JWT field: iss (should be public key of sender)',
      ),
    )
  }
  done(null, keyEncoder.encodePublic(trimLeading0x(payload.iss), 'raw', 'pem'))
}

export function signatureAndExpirationHandler(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  try {
    jwt({
      secret: getPublicKeyFromPayloadCallback,
      algorithms: ['ES256'],
    })(req, res, next)
  } catch (error) {
    if (!(error instanceof JwtUnauthorizedError)) {
      throw new UnauthorizedError('Error while validating JWT')
    } else {
      throw error
    }
  }
}

export function getJwtToken(req: express.Request): string {
  const authorizationHeader = req?.headers?.authorization
  if (!authorizationHeader) {
    throw new InvalidAuthParamsError('Missing authorization header')
  }

  const authorizationHeaderParts = authorizationHeader.split(' ')
  if (authorizationHeaderParts.length != 2) {
    throw new InvalidAuthParamsError(
      'Authorization header must contain exactly two parts (scheme and token)',
    )
  }
  if (authorizationHeaderParts[0] != 'Bearer') {
    throw new InvalidAuthParamsError(
      'Authorization header must use the `Bearer` scheme',
    )
  }

  return authorizationHeaderParts[1]
}

export function decodeJwtMiddleware(
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction,
) {
  const token = getJwtToken(req)

  try {
    const payload = jwtDecode<JwtPayload>(token)
    req.user = payload // Mimics the behavior of express-jwt
  } catch (error) {
    throw new InvalidAuthParamsError('Error while decoding JWT token')
  }
  next()
}

/**
 * Checks that the JWT includes an expiration time (`exp`) claim, and that it is no more
 * than EXP_MAX_AGE into the future.
 */
export function verifyJwtExpirationMiddleware(
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction,
) {
  if (!req?.user?.exp) {
    throw new InvalidAuthParamsError(
      'Expiration time is missing from JWT `exp` claim',
    )
  }

  const now = Math.floor(Date.now() / 1000)
  if (req.user.exp >= now + EXP_MAX_AGE) {
    throw new InvalidAuthParamsError(
      'Expiration time is set too far into the future. (>24 hours)',
    )
  }
  next()
}

/**
 * Checks that the address included in the JWT payload (`sub` claim) matches the address
 *  derived from the public key included in the payload (`iss` claim).
 *
 * NOTE: this function does NOT validate the JWT signature. (Just checks that the account data inside the payload is
 *  consistent.)
 */
export function verifyAccountAddressMiddleware(
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction,
) {
  if (!req?.user?.sub) {
    throw new InvalidAuthParamsError(
      'Account address missing from JWT `sub` claim',
    )
  }
  if (!req?.user?.iss) {
    throw new InvalidAuthParamsError('Public key missing from JWT `iss` claim')
  }

  let decodedAddress
  try {
    decodedAddress = ethers.utils.computeAddress(ensureLeading0x(req.user.iss))
  } catch (error) {
    throw new UnauthorizedError(
      'Error while checking provided address against JWT signature',
    )
  }

  if (decodedAddress !== req.user.sub) {
    throw new UnauthorizedError(
      'Address associated with JWT message signature does not match address included in `sub` claim',
    )
  }
  next()
}

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

/**
 * Returns authentication middlewares for handling JWTs. Since certain endpoints require an `exp` claim to be present
 * in the JWT, and others mark it as optional, this function returns two sets of middlewares; one that ensures that
 * the JWT contains an `exp` claim with an appropriate time in the future, and another that neither requires it nor checks
 * that expiration time is at a reasonable time in the future, but does still honor `exp` claims if they are present.
 */
export function getJwtAuthMiddleware(
  authConfig: AuthenticationConfig,
): JwtAuthorizationMiddleware {
  switch (authConfig.jwtAuthStrategy) {
    case JwtAuthStrategy.DecodeOnly:
      // Decodes the JWT, but does not verify its signature. Useful for testing, since the client does not need
      // to provide a correct JWT signature.
      return {
        expirationRequired: [decodeJwtMiddleware],
        expirationOptional: [decodeJwtMiddleware],
      }
    case JwtAuthStrategy.SignatureAndAddress:
      // Verify the JWT signature and check that the provided address matches the one derived from the public key.
      // Use in production.
      return {
        expirationRequired: [
          signatureAndExpirationHandler,
          verifyAccountAddressMiddleware,
          verifyJwtExpirationMiddleware,
        ],
        expirationOptional: [
          signatureAndExpirationHandler,
          verifyAccountAddressMiddleware,
        ],
      }
    default:
      throw new Error(
        `Auth strategy does not have a handler defined: ${authConfig.jwtAuthStrategy}`,
      )
  }
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
    throw new UnauthorizedError('No session found')
  }
  if (new Date() > new Date(req.session.siwe.expirationTime!)) {
    throw new UnauthorizedError('Session expired')
  }
  next()
}
