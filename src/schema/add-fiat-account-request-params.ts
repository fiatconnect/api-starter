import { JSONSchemaType } from 'ajv'
import { FiatAccountSchema, AddFiatAccountRequestParams } from '../types'

export const addFiatAccountRequestParamsSchema: JSONSchemaType<AddFiatAccountRequestParams> =
  {
    $id: 'AddFiatAccountRequestParamsSchema',
    type: 'object',
    properties: {
      fiatAccountSchema: {
        type: 'string',
        enum: Object.values(FiatAccountSchema),
      },
    },
    required: ['fiatAccountSchema'],
  }
