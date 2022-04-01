import express from 'express'
import { availableProviders } from '../mocks/providerResponses'

export default function extractProvider(
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction,
): any {
  const [providerName] = req.baseUrl.split('/').slice(1)

  _res.locals.provider = availableProviders.includes(providerName)
    ? providerName
    : 'default'

  next()
}
