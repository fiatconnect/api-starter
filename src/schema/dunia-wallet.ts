import { JSONSchemaType } from 'ajv'
import { DuniaWallet, FiatAccountType } from '../types'

export const duniaWalletSchema: JSONSchemaType<DuniaWallet> = {
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
  required: [
    'institutionName',
    'accountName',
    'mobile',
    'fiatAccountType',
  ],
}
