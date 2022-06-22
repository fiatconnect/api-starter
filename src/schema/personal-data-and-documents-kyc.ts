import { JSONSchemaType } from 'ajv'
import { KycSchema, KycSchemas } from '../types'

export const personalDataAndDocumentsKycSchema: JSONSchemaType<
  KycSchemas[KycSchema.PersonalDataAndDocuments]
> = {
  $id: 'PersonalDataAndDocumentsKycSchema',
  type: 'object',
  properties: {
    firstName: {
      type: 'string',
    },
    middleName: {
      type: 'string',
      nullable: true,
    },
    lastName: {
      type: 'string',
    },
    dateOfBirth: {
      type: 'object',
      properties: {
        day: {
          type: 'string',
        },
        month: {
          type: 'string',
        },
        year: {
          type: 'string',
        },
      },
      required: ['day', 'month', 'year'],
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
        isoCountryCode: {
          type: 'string',
        },
        isoRegionCode: {
          type: 'string',
        },
        city: {
          type: 'string',
        },
        postalCode: {
          type: 'string',
          nullable: true,
        },
      },
      required: ['address1', 'isoCountryCode', 'isoRegionCode', 'city'],
    },
    phoneNumber: {
      type: 'string',
    },
    selfieDocument: {
      type: 'string',
    },
    identificationDocument: {
      type: 'string',
    },
  },
  required: [
    'firstName',
    'lastName',
    'dateOfBirth',
    'address',
    'phoneNumber',
    'selfieDocument',
    'identificationDocument',
  ],
}
