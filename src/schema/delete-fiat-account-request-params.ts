import { JSONSchemaType } from 'ajv'
import { DeleteFiatAccountRequestParams } from '../types'

export const deleteFiatAccountRequestParamsSchema: JSONSchemaType<DeleteFiatAccountRequestParams> =
  {
    $id: 'DeleteFiatAccountRequestParamsSchema',
    type: 'object',
    properties: {
      fiatAccountId: {
        type: 'string',
      },
    },
    required: ['fiatAccountId'],
  }
