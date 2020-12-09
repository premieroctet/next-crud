import { TOrderByField, TOrderByOperator } from '../../../types'
import { TPrismaOrderBy, TPrismaOrderByOperator } from '../types'

const operatorsAssociation: Record<TOrderByOperator, TPrismaOrderByOperator> = {
  $asc: 'asc',
  $desc: 'desc',
}

export const parsePrismaOrderBy = (orderBy: TOrderByField): TPrismaOrderBy => {
  const parsed: TPrismaOrderBy = {}

  Object.keys(orderBy).forEach((key) => {
    const value = orderBy[key]

    parsed[key] = operatorsAssociation[value]
  })

  return parsed
}
