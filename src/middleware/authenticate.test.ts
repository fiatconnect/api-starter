import {
  getPublicKeyFromPayloadCallback,
  getJwtToken,
  decodeJwtMiddleware,
  verifyAccountAddressMiddleware,
  getJwtAuthMiddleware,
  verifyJwtExpirationMiddleware,
} from './authenticate'
import express from 'express'
import { ALFAJORES_FORNO_URL } from '../config'
import {
  JwtAuthStrategy,
  ClientAuthStrategy,
  Network,
  InvalidAuthParamsError,
  UnauthorizedError,
} from '../types'
import jwt from 'jsonwebtoken'
import { getMockResponse } from '../mocks/express-response'
import request from 'supertest'
import { errorToStatusCode } from './error'

describe('Authentication', () => {
  const privateKeyPem = `-----BEGIN EC PRIVATE KEY-----
MHQCAQEEIO0uPYAsRectdUcDbE670yLjK8VOVOY71Fa82tq0Q0akoAcGBSuBBAAK
oUQDQgAEG8lfOD/lUwUtwlyTn2BNDoGvLZXuVi7qCljdgjnhGVcZlmLFTcjngRXK
gptIntAnWrqjmM4Zwb539J4l2YAu6A==
-----END EC PRIVATE KEY-----` // in raw format this is 0xed2e3d802c45e72d7547036c4ebbd322e32bc54e54e63bd456bcdadab44346a4
  const publicKey =
    '0x021bc95f383fe553052dc25c939f604d0e81af2d95ee562eea0a58dd8239e11957'
  const publicKeyPem = `-----BEGIN PUBLIC KEY-----
MDYwEAYHKoZIzj0CAQYFK4EEAAoDIgACG8lfOD/lUwUtwlyTn2BNDoGvLZXuVi7q
CljdgjnhGVc=
-----END PUBLIC KEY-----`
  const accountAddress = '0x40Fa2afe93254fc9C82857ee6b79330a08d335fB'

  const alfajoresParams = {
    web3ProviderUrl: ALFAJORES_FORNO_URL,
    clientAuthStrategy: ClientAuthStrategy.Optional,
    network: Network.Alfajores,
  }
  describe('Auth Helper Functions', () => {
    describe('verifyJwtExpirationMiddleware', () => {
      it('throws when exp claim is missing', () => {
        const req: Partial<express.Request> = {
          user: {
            iss: 'not an exp claim',
          },
        }
        const next = jest.fn()
        const res = getMockResponse()
        expect(() => {
          verifyJwtExpirationMiddleware(
            req as express.Request,
            res as express.Response,
            next,
          )
        }).toThrow(
          new InvalidAuthParamsError(
            'Expiration time is missing from JWT `exp` claim',
          ),
        )
        expect(next).not.toHaveBeenCalled()
      })
      it('throws when expiration time is set too far into the future', () => {
        const req: Partial<express.Request> = {
          user: {
            exp: Date.now() / 1000 + 7 * 24 * 60 * 60,
          },
        }
        const next = jest.fn()
        const res = getMockResponse()
        expect(() => {
          verifyJwtExpirationMiddleware(
            req as express.Request,
            res as express.Response,
            next,
          )
        }).toThrow(
          new InvalidAuthParamsError(
            'Expiration time is set too far into the future. (>24 hours)',
          ),
        )
        expect(next).not.toHaveBeenCalled()
      })
      it('returns when expiration time is present and set to a valid time', () => {
        const req: Partial<express.Request> = {
          user: {
            exp: Date.now() / 1000 + 10 * 60 * 60,
          },
        }
        const next = jest.fn()
        const res = getMockResponse()
        expect(() => {
          verifyJwtExpirationMiddleware(
            req as express.Request,
            res as express.Response,
            next,
          )
        }).not.toThrow()
        expect(next).toHaveBeenCalled()
      })
    })
    describe('getPublicKeyFromPayloadCallback', () => {
      it('returns iss claim', () => {
        const payload = {
          iss: publicKey,
        }

        const done = jest.fn()
        getPublicKeyFromPayloadCallback({} as express.Request, payload, done)
        expect(done).toHaveBeenCalledWith(null, publicKeyPem)
      })
      it('throws when iss claim missing', () => {
        const payload = {
          sub: 'some-sub-claim',
        }
        const done = jest.fn()

        getPublicKeyFromPayloadCallback({} as express.Request, payload, done)
        expect(done).toHaveBeenCalledTimes(1)
        expect(done.mock.calls[0][0] instanceof InvalidAuthParamsError)
      })
    })
    describe('getJwtToken', () => {
      it('returns token', () => {
        const req: Partial<express.Request> = {
          headers: {
            authorization: 'Bearer some-bearer-token',
          },
        }
        const token = getJwtToken(req as express.Request)
        expect(token).toEqual('some-bearer-token')
      })

      it('throws when Authorization header missing', () => {
        const req: Partial<express.Request> = {
          headers: {
            'not-auth-header': 'some string',
          },
        }
        expect(() => {
          getJwtToken(req as express.Request)
        }).toThrow(new InvalidAuthParamsError('Missing authorization header'))
      })
      it('throws when Authorization header is poorly formed', () => {
        const req: Partial<express.Request> = {
          headers: {
            authorization: 'Bearer token, Basic another-token',
          },
        }
        expect(() => {
          getJwtToken(req as express.Request)
        }).toThrow(
          new InvalidAuthParamsError(
            'Authorization header must contain exactly two parts (scheme and token)',
          ),
        )
      })
      it('throws when Authorization scheme is not `Bearer`', () => {
        const req: Partial<express.Request> = {
          headers: {
            authorization: 'Basic token',
          },
        }
        expect(() => {
          getJwtToken(req as express.Request)
        }).toThrow(
          new InvalidAuthParamsError(
            'Authorization header must use the `Bearer` scheme',
          ),
        )
      })
    })
    describe('decodeJwtMiddleware', () => {
      it('returns JWT payload when signed correctly', () => {
        const payload = {
          iss: 'some-iss-claim',
        }
        const token = jwt.sign(payload, privateKeyPem, {
          algorithm: 'ES256',
          expiresIn: '5m',
          mutatePayload: true, // So we have access to the generated claims in our original object for testing purposes
        })
        const req: Partial<express.Request> = {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
        const next = jest.fn()
        const res = getMockResponse()
        decodeJwtMiddleware(
          req as express.Request,
          res as express.Response,
          next,
        )
        expect(next).toHaveBeenCalled()
        expect(req.user).toEqual(payload)
      })
      it('returns JWT payload when signed incorrectly', () => {
        const payload = {
          iss: 'some-iss-claim',
        }
        const token = jwt.sign(payload, privateKeyPem, {
          algorithm: 'ES256',
          expiresIn: '5m',
          mutatePayload: true, // So we have access to the generated claims in our original object for testing purposes
        })

        const badSignature = jwt
          .sign({}, privateKeyPem, {
            algorithm: 'ES256',
            expiresIn: '5m',
          })
          .split('.')[2]

        const tokenWithBadSignature = `${token.split('.')[0]}.${
          token.split('.')[1]
        }.${badSignature}`

        const req: Partial<express.Request> = {
          headers: {
            authorization: `Bearer ${tokenWithBadSignature}`,
          },
        }
        const next = jest.fn()
        const res = getMockResponse()
        decodeJwtMiddleware(
          req as express.Request,
          res as express.Response,
          next,
        )
        expect(next).toHaveBeenCalled()
        expect(req.user).toEqual(payload)
      })
      it('throws when error decoding JWT payload', () => {
        const payload = {
          iss: 'some-iss-claim',
        }
        const token = jwt.sign(payload, privateKeyPem, {
          algorithm: 'ES256',
          expiresIn: '5m',
        })

        const tokenWithBadPayload = `${token.split('.')[0]}.qwertyuiop.${
          token.split('.')[2]
        }`
        const req: Partial<express.Request> = {
          headers: {
            authorization: `Bearer ${tokenWithBadPayload}`,
          },
        }
        const next = jest.fn()
        const res = getMockResponse()
        expect(() => {
          decodeJwtMiddleware(
            req as express.Request,
            res as express.Response,
            next,
          )
        }).toThrow(new InvalidAuthParamsError('Error while decoding JWT token'))
        expect(next).not.toHaveBeenCalled()
      })
      it('throws when error getting JWT token', () => {
        const req: Partial<express.Request> = {
          headers: {
            'not-authorization': 'some random string',
          },
        }
        const next = jest.fn()
        const res = getMockResponse()
        expect(() => {
          decodeJwtMiddleware(
            req as express.Request,
            res as express.Response,
            next,
          )
        }).toThrow(InvalidAuthParamsError)
        expect(next).not.toHaveBeenCalled()
      })
    })
    describe('verifyAccountAddressMiddleware', () => {
      it('throws when payload missing `sub` claim', () => {
        const req: Partial<express.Request> = {
          user: {
            iss: publicKey,
          },
        }
        const next = jest.fn()
        const res = getMockResponse()
        expect(() => {
          verifyAccountAddressMiddleware(
            req as express.Request,
            res as express.Response,
            next,
          )
        }).toThrow(InvalidAuthParamsError)
        expect(next).not.toHaveBeenCalled()
      })
      it('throws when payload missing `iss` claim', () => {
        const req: Partial<express.Request> = {
          user: {
            sub: accountAddress,
          },
        }
        const next = jest.fn()
        const res = getMockResponse()
        expect(() => {
          verifyAccountAddressMiddleware(
            req as express.Request,
            res as express.Response,
            next,
          )
        }).toThrow(InvalidAuthParamsError)
        expect(next).not.toHaveBeenCalled()
      })
      it('throws when error deriving address from public key', () => {
        const req: Partial<express.Request> = {
          user: {
            sub: accountAddress,
            iss: 'not an actual public key',
          },
        }
        const next = jest.fn()
        const res = getMockResponse()
        expect(() => {
          verifyAccountAddressMiddleware(
            req as express.Request,
            res as express.Response,
            next,
          )
        }).toThrow(UnauthorizedError)
        expect(next).not.toHaveBeenCalled()
      })
      it('throws when provided address does not match dervied address', () => {
        const req: Partial<express.Request> = {
          user: {
            sub: '0x0000000000000000000000000000000000000000',
            iss: publicKey,
          },
        }
        const next = jest.fn()
        const res = getMockResponse()
        expect(() => {
          verifyAccountAddressMiddleware(
            req as express.Request,
            res as express.Response,
            next,
          )
        }).toThrow(UnauthorizedError)
        expect(next).not.toHaveBeenCalled()
      })
      it('returns when provided address matches derived address', () => {
        const req: Partial<express.Request> = {
          user: {
            sub: accountAddress,
            iss: publicKey,
          },
        }
        const next = jest.fn()
        const res = getMockResponse()
        verifyAccountAddressMiddleware(
          req as express.Request,
          res as express.Response,
          next,
        )
        expect(next).toHaveBeenCalled()
      })
    })
  })
  describe('Auth Middleware', () => {
    let app: express.Application
    describe('DecodeOnly', () => {
      const decodeOnlyAuth: express.RequestHandler[] = getJwtAuthMiddleware({
        jwtAuthStrategy: JwtAuthStrategy.DecodeOnly,
        ...alfajoresParams,
      }).expirationRequired

      // Tiny integration test setup that lets us easily test the auth middleware only
      beforeEach(() => {
        app = express()
        app.use(decodeOnlyAuth)
        app.use((_req, res) => res.status(200).send())
        app.use(errorToStatusCode)
      })

      it('rejects request when Authorization header is missing', async () => {
        const response = await request(app).get('/')
        expect(response.status).toEqual(400)
        expect(response.body).toEqual({ error: 'Missing authorization header' })
      })
      it('rejects request when JWT payload is poorly formed', async () => {
        const response = await request(app)
          .get('/')
          .set('Authorization', 'Bearer some-token')
        expect(response.status).toEqual(400)
        expect(response.body).toEqual({
          error: 'Error while decoding JWT token',
        })
      })
      it('accepts request when JWT has invalid signature', async () => {
        const payload = {
          iss: 'some-iss-claim',
        }
        const token = jwt.sign(payload, privateKeyPem, {
          algorithm: 'ES256',
          expiresIn: '5m',
        })

        const badSignature = jwt
          .sign({}, privateKeyPem, {
            algorithm: 'ES256',
            expiresIn: '5m',
          })
          .split('.')[2]

        const tokenWithBadSignature = `${token.split('.')[0]}.${
          token.split('.')[1]
        }.${badSignature}`

        const response = await request(app)
          .get('/')
          .set('Authorization', `Bearer ${tokenWithBadSignature}`)
        expect(response.status).toEqual(200)
      })
      it('accepts request when JWT has valid signature', async () => {
        const payload = {
          iss: 'some-iss-claim',
        }
        const token = jwt.sign(payload, privateKeyPem, {
          algorithm: 'ES256',
          expiresIn: '5m',
        })

        const response = await request(app)
          .get('/')
          .set('Authorization', `Bearer ${token}`)
        expect(response.status).toEqual(200)
      })
    })
    describe('SignatureAndAddress', () => {
      const signatureAndAddressAuth: express.RequestHandler[] =
        getJwtAuthMiddleware({
          jwtAuthStrategy: JwtAuthStrategy.SignatureAndAddress,
          ...alfajoresParams,
        }).expirationRequired
      // Tiny integration test setup that lets us easily test the auth middleware only
      beforeEach(() => {
        app = express()
        app.use(signatureAndAddressAuth)
        app.use((_req, res) => res.status(200).send())
        app.use(errorToStatusCode)
      })
      it('rejects request when Authorization header is missing', async () => {
        const response = await request(app).get('/')
        expect(response.status).toEqual(401)
        expect(response.body).toEqual({
          error: 'No authorization token was found',
        })
      })
      it('rejects request when JWT payload is poorly formed', async () => {
        const response = await request(app)
          .get('/')
          .set('Authorization', 'Bearer some-token')
        expect(response.status).toEqual(401)
        expect(response.body).toEqual({ error: 'Error while validating JWT' })
      })
      it('rejects request when JWT has invalid signature', async () => {
        const payload = {
          iss: publicKey,
        }
        const token = jwt.sign(payload, privateKeyPem, {
          algorithm: 'ES256',
          expiresIn: '5m',
        })

        const badSignature = jwt
          .sign({}, privateKeyPem, {
            algorithm: 'ES256',
            expiresIn: '5m',
          })
          .split('.')[2]

        const tokenWithBadSignature = `${token.split('.')[0]}.${
          token.split('.')[1]
        }.${badSignature}`

        const response = await request(app)
          .get('/')
          .set('Authorization', `Bearer ${tokenWithBadSignature}`)
        expect(response.status).toEqual(401)
        expect(response.body).toEqual({ error: 'invalid signature' })
      })
      it('rejects request when JWT is missing `sub` claim', async () => {
        const payload = {
          iss: publicKey,
        }
        const token = jwt.sign(payload, privateKeyPem, {
          algorithm: 'ES256',
          expiresIn: '5m',
        })

        const response = await request(app)
          .get('/')
          .set('Authorization', `Bearer ${token}`)
        expect(response.status).toEqual(400)
        expect(response.body).toEqual({
          error: 'Account address missing from JWT `sub` claim',
        })
      })
      it('rejects request when JWT is missing `iss` claim', async () => {
        const payload = {
          sub: accountAddress,
        }
        const token = jwt.sign(payload, privateKeyPem, {
          algorithm: 'ES256',
          expiresIn: '5m',
        })

        const response = await request(app)
          .get('/')
          .set('Authorization', `Bearer ${token}`)
        expect(response.status).toEqual(400)
        expect(response.body).toEqual({
          error:
            'Missing required JWT field: iss (should be public key of sender)',
        })
      })
      it('rejects request when `sub` claim does not match derived address', async () => {
        const payload = {
          iss: publicKey,
          sub: '0x0000000000000000000000000000000000000000',
        }
        const token = jwt.sign(payload, privateKeyPem, {
          algorithm: 'ES256',
          expiresIn: '5m',
        })

        const response = await request(app)
          .get('/')
          .set('Authorization', `Bearer ${token}`)
        expect(response.status).toEqual(401)
        expect(response.body).toEqual({
          error:
            'Address associated with JWT message signature does not match address included in `sub` claim',
        })
      })
      it('rejects request when JWT is missing exp claim', async () => {
        const payload = {
          iss: publicKey,
          sub: accountAddress,
        }
        const token = jwt.sign(payload, privateKeyPem, {
          algorithm: 'ES256',
        })

        const response = await request(app)
          .get('/')
          .set('Authorization', `Bearer ${token}`)
        expect(response.status).toEqual(400)
        expect(response.body).toEqual({
          error: 'Expiration time is missing from JWT `exp` claim',
        })
      })
      it('rejects request when JWT is missing exp claim', async () => {
        const payload = {
          iss: publicKey,
          sub: accountAddress,
        }
        const token = jwt.sign(payload, privateKeyPem, {
          algorithm: 'ES256',
          expiresIn: '7d',
        })

        const response = await request(app)
          .get('/')
          .set('Authorization', `Bearer ${token}`)
        expect(response.status).toEqual(400)
        expect(response.body).toEqual({
          error: 'Expiration time is set too far into the future. (>24 hours)',
        })
      })
      it('accepts request when signature is valid and `sub` claim matches derived address', async () => {
        const payload = {
          iss: publicKey,
          sub: accountAddress,
        }
        const token = jwt.sign(payload, privateKeyPem, {
          algorithm: 'ES256',
          expiresIn: '5m',
        })

        const response = await request(app)
          .get('/')
          .set('Authorization', `Bearer ${token}`)
        expect(response.status).toEqual(200)
      })
    })
  })
})
