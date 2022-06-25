import Ajv from 'ajv'
import { ValidationError } from '../types'

import { quoteRequestBodySchema } from './quote-request-body'
import { kycRequestParamsSchema } from './kyc-request-params'
import { personalDataAndDocumentsKycSchema } from './personal-data-and-documents-kyc'
import { postFiatAccountRequestBodySchema } from './post-fiat-account-request-body'
import { deleteFiatAccountRequestParamsSchema } from './delete-fiat-account-request-params'
import { transferRequestBodySchema } from './transfer-request-body'
import { transferStatusRequestParamsSchema } from './transfer-status-request-params'
import { authRequestBodySchema } from './auth-request-body'

const ajv = new Ajv({
  schemas: [
    quoteRequestBodySchema,
    kycRequestParamsSchema,
    personalDataAndDocumentsKycSchema,
    postFiatAccountRequestBodySchema,
    deleteFiatAccountRequestParamsSchema,
    transferRequestBodySchema,
    transferStatusRequestParamsSchema,
    authRequestBodySchema,
  ],
})

export function validateSchema<T>(data: any, schema: string): T {
  if (ajv.validate(schema, data)) return data

  throw new ValidationError(
    `Error while validating schema: invalid ${schema}`,
    ajv.errors,
  )
}
