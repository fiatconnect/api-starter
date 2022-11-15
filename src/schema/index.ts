import { ValidationError } from '../types'

import { z, ZodError } from 'zod'
import { ZodType } from 'zod/lib/types'

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
