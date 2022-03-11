import express from 'express'
import {
  ValidationError,
  InvalidAuthParamsError,
  UnauthorizedError,
} from '../types'
import { UnauthorizedError as JwtUnauthorizedError } from 'express-jwt'

export const errorToStatusCode = (
  error: Error,
  _: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  if (error instanceof ValidationError) {
    res.status(400).json({
      error: error.message,
      data: error.validationError,
    })
  } else if (
    error instanceof UnauthorizedError ||
    error instanceof JwtUnauthorizedError
  ) {
    res.status(401).json({
      error: error.message,
    })
  } else if (error instanceof InvalidAuthParamsError) {
    res.status(400).json({
      error: error.message,
    })
  } else {
    next(error)
  }
}
