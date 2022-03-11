import Ajv from 'ajv'
import { ValidationError } from '../types'

import { quoteRequestQuerySchema } from './quote-request-query'
import { kycRequestParamsSchema } from './kyc-request-params'
import { personalDataAndDocumentsKycSchema } from './personal-data-and-documents-kyc'
import { addFiatAccountRequestParamsSchema } from './add-fiat-account-request-params'
import { deleteFiatAccountRequestParamsSchema } from './delete-fiat-account-request-params'
import { mockCheckingAccountSchema } from './mock-checking-account'
import { transferRequestBodySchema } from './transfer-request-body'
import { transferStatusRequestParamsSchema } from './transfer-status-request-params'

const ajv = new Ajv({
  schemas: [
    quoteRequestQuerySchema,
    kycRequestParamsSchema,
    personalDataAndDocumentsKycSchema,
    addFiatAccountRequestParamsSchema,
    deleteFiatAccountRequestParamsSchema,
    mockCheckingAccountSchema,
    transferRequestBodySchema,
    transferStatusRequestParamsSchema,
  ],
})

export function validateSchema<T>(data: any, schema: string): T {
  if (ajv.validate(schema, data)) return data

  throw new ValidationError(
    `Error while validating schema: invalid ${schema}`,
    ajv.errors,
  )
}
