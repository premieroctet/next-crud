import * as qs from 'qs'
import { IParsedQueryParams, TSelect } from './types'

const parseSelect = (select: string): TSelect => {
  if (typeof select === 'string') {
    const selectFields: TSelect = {}

    const fields = select.split(',')

    fields.forEach((field) => {
      const parsedField = field.split('.')

      if (parsedField.length > 1) {
        const initialFieldName = parsedField[0]
        parsedField.shift()
        selectFields[initialFieldName] = parsedField
          .reverse()
          .reduce((acc, val, idx) => {
            if (idx === 0) {
              return {
                select: {
                  [val]: true,
                },
              }
            } else {
              return {
                select: {
                  [val]: acc,
                },
              }
            }
          }, (selectFields[initialFieldName] || {}) as TSelect)
      } else {
        selectFields[field] = true
      }
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
      parsedQuery.select = parseSelect(query.select as string)
    }

    return parsedQuery
  }

  return {}
}
