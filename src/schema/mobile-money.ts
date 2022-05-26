import { JSONSchemaType } from 'ajv'
import { MobileMoney, FiatAccountType, SupportedOperatorEnum } from '../types'

export const mobileMoneySchema: JSONSchemaType<MobileMoney> = {
  $id: 'MobileMoneySchema',
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
      enum: [FiatAccountType.MobileMoney],
    },
    mobile: {
      type: 'string',
    },
    operator: {
      type: 'string',
      enum: [
        SupportedOperatorEnum.MTN,
        SupportedOperatorEnum.ORANGE,
        SupportedOperatorEnum.MOOV,
        SupportedOperatorEnum.WAVE,
      ],
    },
    country: {
      type: 'string',
    },
  },
  required: [
    'institutionName',
    'accountName',
    'mobile',
    'operator',
    'country',
    'fiatAccountType',
  ],
}
