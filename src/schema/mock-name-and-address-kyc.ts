import { JSONSchemaType } from 'ajv'
import { MockNameAndAddressKyc } from '../types'

export const mockNameAndAddressKycSchema: JSONSchemaType<MockNameAndAddressKyc> =
  {
    $id: 'MockNameAndAddressKycSchema',
    type: 'object',
    properties: {
      firstName: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      address: {
        type: 'object',
        properties: {
          address1: {
            type: 'string',
          },
          address2: {
            type: 'string',
            nullable: true,
          },
          city: {
            type: 'string',
          },
          region: {
            type: 'string',
          },
          postalCode: {
            type: 'string',
          },
          isoCountryCode: {
            type: 'string',
          },
        },
        required: [
          'address1',
          'city',
          'region',
          'postalCode',
          'isoCountryCode',
        ],
      },
    },
    required: ['firstName', 'lastName', 'address'],
  }
