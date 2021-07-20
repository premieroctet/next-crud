import * as qs from 'qs'
import set from 'lodash.set'
import {
  IParsedQueryParams,
  TOrderByField,
  TRecursiveField,
  TWhereField,
} from './types'

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
  const whereObj = JSON.parse(where)
  const parsed: TWhereField = {}

  Object.keys(whereObj).forEach((key) => {
    set(parsed, key, whereObj[key])
  })

  return parsed
}

const parseOrderBy = (orderBy: string): TOrderByField => {
  const parsed: TOrderByField = {}
  const orderByObj = JSON.parse(orderBy)

  if (Object.keys(orderByObj).length >= 1) {
    const key = Object.keys(orderByObj)[0]

    if (orderByObj[key] === '$asc' || orderByObj[key] === '$desc') {
      parsed[key] = orderByObj[key]
    }
  }

  if (Object.keys(parsed).length !== 1) {
    throw new Error(
      'orderBy needs to be an object with exactly 1 property with either $asc or $desc value'
    )
  }

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
    if (query.orderBy) {
      parsedQuery.orderBy = parseOrderBy(query.orderBy as string)
    }
    if (query.limit) {
      parsedQuery.limit = Number.isFinite(+query.limit)
        ? +query.limit
        : undefined
    }
    if (query.skip) {
      parsedQuery.skip = Number.isFinite(+query.skip) ? +query.skip : undefined
    }
    if (query.distinct) {
      parsedQuery.distinct = query.distinct as string
    }

    return {
      originalQuery: query,
      ...parsedQuery,
    }
  }

  return {}
}
