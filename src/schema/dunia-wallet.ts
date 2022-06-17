import { JSONSchemaType } from 'ajv'
import {
  FiatAccountSchema,
  FiatAccountSchemas,
  FiatAccountType,
} from '../types'

export const duniaWalletSchema: JSONSchemaType<
  FiatAccountSchemas[FiatAccountSchema.DuniaWallet]
> = {
  $id: 'DuniaWalletSchema',
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
      enum: [FiatAccountType.DuniaWallet],
    },
    mobile: {
      type: 'string',
    },
  },
  required: ['institutionName', 'accountName', 'mobile', 'fiatAccountType'],
}
