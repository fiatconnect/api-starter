import express from 'express'

export function asyncRoute(
  handler: express.RequestHandler<any, any, any, any>,
) {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    Promise.resolve(handler(req, res, next)).catch(next)
  }
}
