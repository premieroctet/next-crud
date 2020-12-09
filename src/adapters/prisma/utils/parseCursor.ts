import { isPrimitive } from '../../../utils'
import { TPrismaCursor } from '../types'

export const parsePrismaCursor = (
  cursor: Record<string, string | number | boolean>
): TPrismaCursor => {
  const parsed: TPrismaCursor = {}

  Object.keys(cursor).forEach((key) => {
    const value = cursor[key]

    if (isPrimitive(value)) {
      parsed[key] = value
    }
  })

  if (Object.keys(parsed).length !== 1) {
    throw new Error(
      'cursor needs to be an object with exactly 1 property with a primitive value'
    )
  }

  return parsed
}
