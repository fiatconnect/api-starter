import { JSONSchemaType } from 'ajv'
import { AuthRequestBody } from '../types'

export const authRequestBodySchema: JSONSchemaType<AuthRequestBody> = {
  $id: 'AuthRequestBodySchema',
  type: 'object',
  properties: {
    message: {
      type: 'string',
    },
    signature: {
      type: 'string',
    },
  },
  required: ['message', 'signature'],
}
