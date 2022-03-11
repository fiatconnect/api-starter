import { JSONSchemaType } from 'ajv'
import { TransferStatusRequestParams } from '../types'

export const transferStatusRequestParamsSchema: JSONSchemaType<TransferStatusRequestParams> =
  {
    $id: 'TransferStatusRequestParamsSchema',
    type: 'object',
    properties: {
      transferId: {
        type: 'string',
      },
    },
    required: ['transferId'],
  }
