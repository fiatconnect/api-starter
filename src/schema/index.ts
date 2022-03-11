import Ajv from 'ajv'
import { ValidationError } from '../types'

import { quoteRequestQuerySchema } from './quote-request-query'
import { kycRequestParamsSchema } from './kyc-request-params'
import { mockNameAndAddressKycSchema } from './mock-name-and-address-kyc'
import { addFiatAccountRequestParamsSchema } from './add-fiat-account-request-params'
import { deleteFiatAccountRequestParamsSchema } from './delete-fiat-account-request-params'
import { mockCheckingAccountSchema } from './mock-checking-account'
import { transferRequestBodySchema } from './transfer-request-body'
import { transferStatusRequestParamsSchema } from './transfer-status-request-params'

const ajv = new Ajv({
  schemas: [
    quoteRequestQuerySchema,
    kycRequestParamsSchema,
    mockNameAndAddressKycSchema,
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
