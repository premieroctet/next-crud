import * as qs from 'qs'
import set from 'lodash.set'
import { IParsedQueryParams, TRecursiveField, TWhereField } from './types'

const parseRecursive = (select: string): TRecursiveField => {
  if (typeof select === 'string') {
    const selectFields: TRecursiveField = {}

    const fields = select.split(',')

    fields.forEach((field) => {
      set(selectFields, field, true)
    })

    return selectFields
  }

  throw new Error('select query param must be a string')
}

const parseWhere = (where: string): TWhereField => {
  const whereStr = JSON.parse(where)
  const parsed: TWhereField = {}

  /**
   * TODO:
   * - Determine if we have an array or an object
   * - Set the criteria to the parsed key
   */

  Object.keys(whereStr).forEach((key) => {
    set(parsed, key, whereStr[key])
  })

  return parsed
}

export const parseQuery = (queryString?: string): IParsedQueryParams => {
  if (queryString) {
    const query = qs.parse(queryString)
    const parsedQuery: IParsedQueryParams = {}
    if (query.select) {
      parsedQuery.select = parseRecursive(query.select as string)
    }
    if (query.include) {
      parsedQuery.include = parseRecursive(query.include as string)
    }
    if (query.where) {
      parsedQuery.where = parseWhere(query.where as string)
    }

    return parsedQuery
  }

  return {}
}
