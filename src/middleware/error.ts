import express from 'express'
import {
  ValidationError,
  UnauthorizedError,
  InvalidSiweParamsError,
} from '../types'

export const errorToStatusCode = (
  error: Error,
  _: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  if (error instanceof ValidationError) {
    res.status(400).json({
      error: error.fiatConnectError,
      data: error.validationError,
    })
  } else if (
    error instanceof UnauthorizedError ||
    error instanceof InvalidSiweParamsError
  ) {
    res.status(401).json({
      error: error.fiatConnectError,
    })
  } else {
    next(error)
  }
}
