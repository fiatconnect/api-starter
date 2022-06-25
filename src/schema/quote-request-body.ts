import { JSONSchemaType } from 'ajv'
import { QuoteRequestBody, FiatType, CryptoType } from '../types'

export const quoteRequestBodySchema: JSONSchemaType<QuoteRequestBody> = {
  $id: 'QuoteRequestBodySchema',
  type: 'object',
  properties: {
    fiatType: {
      type: 'string',
      enum: Object.values(FiatType),
    },
    cryptoType: {
      type: 'string',
      enum: Object.values(CryptoType),
    },
    fiatAmount: {
      type: 'string',
      nullable: true,
    },
    cryptoAmount: {
      type: 'string',
      nullable: true,
    },
    country: {
      type: 'string',
    },
    region: {
      type: 'string',
      nullable: true,
    },
  },
  oneOf: [
    {
      required: ['fiatAmount'],
    },
    {
      required: ['cryptoAmount'],
    },
  ],
  required: ['fiatType', 'cryptoType', 'country'],
}
