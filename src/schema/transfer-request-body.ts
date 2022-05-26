import { JSONSchemaType } from 'ajv'
import { TransferRequestBody } from '../types'

export const transferRequestBodySchema: JSONSchemaType<TransferRequestBody> = {
  $id: 'TransferRequestBodySchema',
  type: 'object',
  properties: {
    fiatAccountId: {
      type: 'string',
    },
    quoteId: {
      type: 'string',
    },
  },
  required: ['fiatAccountId', 'quoteId'],
}
