import { siweAuthMiddleware } from './authenticate'
import express from 'express'
import { UnauthorizedError, FiatConnectError } from '../types'
import { getMockResponse } from '../mocks/express-response'
import { SiweMessage } from 'siwe'

describe('Authentication', () => {
  describe('Auth Middleware', () => {
    describe('siweAuthMiddleware', () => {
      it('throws if session is not set', () => {
        const req: Partial<express.Request> = {
          session: {
            id: 'sessionid',
            cookie: {
              originalMaxAge: 1,
            },
            regenerate: jest.fn(),
            destroy: jest.fn(),
            reload: jest.fn(),
            resetMaxAge: jest.fn(),
            save: jest.fn(),
            touch: jest.fn(),
          },
        }
        const next = jest.fn()
        const res = getMockResponse()
        expect(() => {
          siweAuthMiddleware(
            req as express.Request,
            res as express.Response,
            next,
          )
        }).toThrow(new UnauthorizedError())
        expect(next).not.toHaveBeenCalled()
      })
      it('throws if session is expired', () => {
        const req: Partial<express.Request> = {
          session: {
            id: 'sessionid',
            cookie: {
              originalMaxAge: 1,
            },
            regenerate: jest.fn(),
            destroy: jest.fn(),
            reload: jest.fn(),
            resetMaxAge: jest.fn(),
            save: jest.fn(),
            touch: jest.fn(),
            siwe: new SiweMessage({
              expirationTime: '2022-04-22T02:13:00Z',
            }),
          },
        }
        const next = jest.fn()
        const res = getMockResponse()
        expect(() => {
          siweAuthMiddleware(
            req as express.Request,
            res as express.Response,
            next,
          )
        }).toThrow(new UnauthorizedError(FiatConnectError.SessionExpired))
        expect(next).not.toHaveBeenCalled()
      })
      it('passes if session is valid', () => {
        const futureDate = new Date(Date.now() + 60000)
        const req: Partial<express.Request> = {
          session: {
            id: 'sessionid',
            cookie: {
              originalMaxAge: 1,
            },
            regenerate: jest.fn(),
            destroy: jest.fn(),
            reload: jest.fn(),
            resetMaxAge: jest.fn(),
            save: jest.fn(),
            touch: jest.fn(),
            siwe: new SiweMessage({
              expirationTime: futureDate.toISOString(),
            }),
          },
        }
        const next = jest.fn()
        const res = getMockResponse()
        siweAuthMiddleware(
          req as express.Request,
          res as express.Response,
          next,
        )
        expect(next).toHaveBeenCalled()
      })
    })
  })
})
