import { JSONSchemaType } from 'ajv'
import { TransferRequestBody, FiatType, CryptoType } from '../types'

export const transferRequestBodySchema: JSONSchemaType<TransferRequestBody> = {
  $id: 'TransferRequestBodySchema',
  type: 'object',
  properties: {
    fiatType: {
      type: 'string',
      enum: Object.values(FiatType),
    },
    cryptoType: {
      type: 'string',
      enum: Object.values(CryptoType),
    },
    amount: {
      type: 'string',
    },
    fiatAccountId: {
      type: 'string',
    },
  },
  required: ['fiatType', 'cryptoType', 'amount', 'fiatAccountId'],
}
