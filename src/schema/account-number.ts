import { JSONSchemaType } from 'ajv'
import {
  FiatAccountSchema,
  FiatAccountSchemas,
  FiatAccountType,
} from '../types'

export const accountNumberSchema: JSONSchemaType<
  FiatAccountSchemas[FiatAccountSchema.AccountNumber]
> = {
  $id: 'AccountNumberSchema',
  type: 'object',
  properties: {
    institutionName: {
      type: 'string',
    },
    accountName: {
      type: 'string',
    },
    fiatAccountType: {
      type: 'string',
      enum: [FiatAccountType.BankAccount],
    },
    accountNumber: {
      type: 'string',
    },
    country: {
      type: 'string',
    },
  },
  required: [
    'institutionName',
    'accountName',
    'accountNumber',
    'country',
    'fiatAccountType',
  ],
}
