import { JSONSchemaType } from 'ajv'
import { KycSchema, KycRequestParams } from '../types'

export const kycRequestParamsSchema: JSONSchemaType<KycRequestParams> = {
  $id: 'KycRequestParamsSchema',
  type: 'object',
  properties: {
    kycSchema: {
      type: 'string',
      enum: Object.values(KycSchema),
    },
  },
  required: ['kycSchema'],
}
