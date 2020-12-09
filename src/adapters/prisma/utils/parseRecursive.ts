import { TRecursiveField } from '../../../types'
import { TPrismaRecursive, TPrismaRecursiveField } from '../types'

export const parsePrismaRecursiveField = <T extends TPrismaRecursiveField>(
  select: TRecursiveField,
  fieldName: T
): TPrismaRecursive<T> => {
  const parsed: TPrismaRecursive<T> = {}

  Object.keys(select).forEach((field) => {
    if (select[field] !== true) {
      parsed[field] = {
        [fieldName]: parsePrismaRecursiveField(
          select[field] as TRecursiveField,
          fieldName
        ),
      } as Record<T, TPrismaRecursive<T>>
    } else {
      parsed[field] = true
    }
  })

  return parsed
}
