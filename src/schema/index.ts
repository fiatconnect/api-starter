import Ajv from 'ajv'
import { ValidationError } from '../types'

import { quoteRequestBodySchema } from './quote-request-body'
import { kycRequestParamsSchema } from './kyc-request-params'
import { personalDataAndDocumentsKycSchema } from './personal-data-and-documents-kyc'
import { postFiatAccountRequestBodySchema } from './post-fiat-account-request-body'
import { deleteFiatAccountRequestParamsSchema } from './delete-fiat-account-request-params'
import { transferRequestBodySchema } from './transfer-request-body'
import { transferStatusRequestParamsSchema } from './transfer-status-request-params'
import { authRequestBodySchema } from './auth-request-body'
import {AnyZodObject, z, ZodError} from "zod";

const ajv = new Ajv({
  schemas: [
    quoteRequestBodySchema,
    kycRequestParamsSchema,
    personalDataAndDocumentsKycSchema,
    postFiatAccountRequestBodySchema,
    deleteFiatAccountRequestParamsSchema,
    transferRequestBodySchema,
    transferStatusRequestParamsSchema,
    authRequestBodySchema,
  ],
})

/**
 * Validate AJV schema
 *
 * @deprecated - prefer validateZodSchema (more re-usable with fiatconnect-types)
 *
 * @param data
 * @param schema
 */
export function validateSchema<T>(data: any, schema: string): T {
  if (ajv.validate(schema, data)) return data

  throw new ValidationError(
    `Error while validating schema: invalid ${schema}`,
    ajv.errors,
  )
}

/**
 * Validate zod schema
 *
 * @param obj
 * @param schema
 */
export function validateZodSchema<T extends AnyZodObject>(obj: any, schema: T): z.infer<T> {
  try {
    return schema.parse(obj)
  } catch (err) {
    if (err instanceof ZodError) {
      throw new ValidationError(
        `Error validating object with schema ${
          schema.description
        }`,
        err.issues
      )
    }
    throw err
  }
}
