import { types } from 'util'
import isObject from 'lodash.isobject'
import {
  TCondition,
  TSearchCondition,
  TWhereCondition,
  TWhereField,
  TWhereOperator,
} from '../../../types'
import { isPrimitive } from '../../../utils'
import {
  TPrismaFieldFilter,
  TPrismaWhereOperator,
  TPrismaWhereField,
  TPrismaRelationFitler,
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

const isRelation = (key: string, manyRelations: string[]): boolean => {
  // Get the key containing . and remove the property name
  const splitKey = key.split('.')
  splitKey.splice(-1, 1)

  return manyRelations.includes(splitKey.join('.'))
}

const parseSimpleField = (value: TCondition) => {
  const operator = Object.keys(value)[0]
  const prismaOperator: TPrismaWhereOperator = operatorsAssociation[operator]

  if (prismaOperator) {
    return {
      [prismaOperator]: value[operator],
    }
  }
}

const parseObjectCombination = (
  obj: TCondition,
  manyRelations: string[]
): TPrismaFieldFilter => {
  const parsed: TPrismaFieldFilter = {}

  Object.keys(obj).forEach((key) => {
    const val = obj[key]

    if (isRelation(key, manyRelations)) {
      parseRelation(val, key, parsed, manyRelations)
    } else if (isPrimitive(val)) {
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

const basicParse = (
  value: string | number | boolean | TCondition | Date | TWhereCondition,
  key: string,
  parsed: TPrismaWhereField,
  manyRelations: string[]
) => {
  if (isPrimitive(value)) {
    parsed[key] = getSearchValue(value)
  } else {
    switch (key) {
      case '$or': {
        if (isObject(value)) {
          parsed.OR = parseObjectCombination(value as TCondition, manyRelations)
        }
        break
      }
      case '$and': {
        if (isObject(value)) {
          parsed.AND = parseObjectCombination(
            value as TCondition,
            manyRelations
          )
        }
        break
      }
      case '$not': {
        if (isObject(value)) {
          parsed.NOT = parseObjectCombination(
            value as TCondition,
            manyRelations
          )
        }
        break
      }
      default: {
        parsed[key] = parseSimpleField(value as TCondition)
        break
      }
    }
  }
}

const parseRelation = (
  value: string | number | boolean | Date | TCondition | TWhereCondition,
  key: string,
  parsed: TPrismaWhereField,
  manyRelations: string[]
) => {
  // Reverse the keys so that we can format our object by nesting
  const fields = key.split('.').reverse()
  let formatFields = {}
  fields.forEach((field, index) => {
    // If we iterate over the property name, which is index 0, we parse it like a normal field
    if (index === 0) {
      basicParse(value, field, formatFields, manyRelations)
    }
    // Else we format the relation filter in the prisma way
    else {
      formatFields = {
        [field]: {
          some: formatFields,
        },
      }
    }
  })
  // Retrieve the main relation field
  const initialFieldKey = fields.reverse()[0]
  // Retrieve the old parsed version
  const oldParsed = parsed[initialFieldKey] as TPrismaRelationFitler
  // Format correctly in the prisma way
  parsed[initialFieldKey] = {
    some: {
      // @ts-ignore
      ...(oldParsed?.some || {}),
      ...formatFields[initialFieldKey].some,
    },
  }
}

export const parsePrismaWhere = (
  where: TWhereField,
  manyRelations: string[]
): TPrismaWhereField => {
  const parsed: TPrismaWhereField = {}

  Object.keys(where).forEach((key) => {
    const value = where[key]
    /**
     * If the key without property name is a relation
     *
     * We want the following example input:
     *
     * posts.author.id: 1
     *
     * to output
     *
     * {
     *  posts: {
     *    some: {
     *      author: {
     *        some: {
     *          id: 1
     *        }
     *      }
     *    }
     *  }
     * }
     */
    if (isRelation(key, manyRelations)) {
      parseRelation(value, key, parsed, manyRelations)
    } else {
      basicParse(value, key, parsed, manyRelations)
    }
  })

  return parsed
}
