import Ajv from 'ajv'
import { ValidationError } from '../types'

import { z, ZodError } from 'zod'
import { ZodType } from 'zod/lib/types'

const ajv = new Ajv({})

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
export function validateZodSchema<T extends ZodType>(
  obj: any,
  schema: T,
): z.infer<T> {
  try {
    return schema.parse(obj)
  } catch (err) {
    if (err instanceof ZodError) {
      throw new ValidationError(
        `Error validating object with schema ${schema.description}`,
        err.issues,
      )
    }
    throw err
  }
}
