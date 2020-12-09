import { types } from 'util'
import isObject from 'lodash.isobject'
import {
  TCondition,
  TSearchCondition,
  TWhereField,
  TWhereOperator,
} from '../../../types'
import { isPrimitive } from '../../../utils'
import {
  TPrismaFieldFilter,
  TPrismaWhereOperator,
  TPrismaWhereField,
} from '../types'

const operatorsAssociation: {
  [key in TWhereOperator]?: TPrismaWhereOperator
} = {
  $eq: 'equals',
  $neq: 'not',
  $cont: 'contains',
  $ends: 'endsWith',
  $gt: 'gt',
  $gte: 'gte',
  $in: 'in',
  $lt: 'lt',
  $lte: 'lte',
  $notin: 'notIn',
  $starts: 'startsWith',
}

const getSearchValue = (originalValue: any): TSearchCondition => {
  if (types.isDate(originalValue)) {
    return new Date(originalValue)
  }

  if (typeof originalValue === 'string' && originalValue === '$isnull') {
    return null
  }

  return originalValue
}

/**
 * This function is used to parse simple fields
 * but in the near future it will be used to also
 * handle nested fields
 */
// const parseRecursiveField = (
//   where: TCondition,
//   manyRelations: string[]
// ): TPrismaFieldFilter => {
//   const parsed: TPrismaFieldFilter = {}

//   Object.keys(where).forEach((field) => {
//   })

//   return parsed
// }

const parseSimpleField = (value: TCondition) => {
  const operator = Object.keys(value)[0]
  const prismaOperator: TPrismaWhereOperator = operatorsAssociation[operator]

  if (prismaOperator) {
    return {
      [prismaOperator]: value[operator],
    }
  }
}

const parseObjectCombination = (obj: TCondition): TPrismaFieldFilter => {
  const parsed: TPrismaFieldFilter = {}

  Object.keys(obj).forEach((key) => {
    const val = obj[key]

    if (isPrimitive(val)) {
      parsed[key] = val as TSearchCondition
    } else if (isObject(val)) {
      const fieldResult = parseSimpleField(val as TCondition)

      if (fieldResult) {
        parsed[key] = fieldResult
      }
    }
  })

  return parsed
}

export const parsePrismaWhere = (
  where: TWhereField,
  // Not used currently, will be used for a future version
  manyRelations: string[]
): TPrismaWhereField => {
  const parsed: TPrismaWhereField = {}

  Object.keys(where).forEach((key) => {
    const value = where[key]

    if (isPrimitive(value)) {
      parsed[key] = getSearchValue(value)
    } else {
      switch (key) {
        case '$or': {
          if (isObject(value)) {
            parsed.OR = parseObjectCombination(value as TCondition)
          }
          break
        }
        case '$and': {
          if (isObject(value)) {
            parsed.AND = parseObjectCombination(value as TCondition)
          }
          break
        }
        case '$not': {
          if (isObject(value)) {
            parsed.NOT = parseObjectCombination(value as TCondition)
          }
          break
        }
        default: {
          parsed[key] = parseSimpleField(value as TCondition)
          break
        }
      }
    }
  })

  return parsed
}
