import { JSONSchemaType } from 'ajv'
import { MockCheckingAccount, FiatType } from '../types'

export const mockCheckingAccountSchema: JSONSchemaType<MockCheckingAccount> = {
  $id: 'MockCheckingAccountSchema',
  type: 'object',
  properties: {
    bankName: {
      type: 'string',
    },
    accountName: {
      type: 'string',
    },
    fiatType: {
      type: 'string',
      enum: Object.values(FiatType),
    },
    accountNumber: {
      type: 'string',
    },
    routingNumber: {
      type: 'string',
    },
  },
  required: [
    'bankName',
    'accountName',
    'fiatType',
    'accountNumber',
    'routingNumber',
  ],
}
