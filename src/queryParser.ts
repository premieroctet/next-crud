import * as qs from 'qs'
import set from 'lodash.set'
import { IParsedQueryParams, TRecursiveField } from './types'

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

    return parsedQuery
  }

  return {}
}
