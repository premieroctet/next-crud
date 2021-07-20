import type { TSearchCondition } from '../../types'

export type TPrismaRecursiveField = 'select' | 'include'

export type TPrismaRecursive<T extends TPrismaRecursiveField> = Record<
  string,
  boolean | { [key in T]: TPrismaRecursive<T> }
>

export type TPrismaWhereOperator =
  | 'equals'
  | 'not'
  | 'in'
  | 'notIn'
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte'
  | 'contains'
  | 'startsWith'
  | 'endsWith'

export type TPrismaOrderByOperator = 'asc' | 'desc'

export type TPrismaFieldFilterOperator = {
  [key in TPrismaWhereOperator]?: TSearchCondition
}

export type TPrismaFieldFilter = {
  [key: string]:
    | TSearchCondition
    | TPrismaFieldFilterOperator
    | TPrismaRelationFitler
}

export type TPrismaWhereField = TPrismaFieldFilter & {
  AND?: TPrismaFieldFilter
  OR?: TPrismaFieldFilter
  NOT?: TPrismaFieldFilter
}

export type TPrismaRelationFitler = {
  some: TSearchCondition | TPrismaFieldFilter
}

export type TPrismaOrderBy = {
  [key: string]: TPrismaOrderByOperator
}

export type TPrismaCursor = {
  [key: string]: string | number | boolean
}

export interface IPrismaParsedQueryParams {
  select?: TPrismaRecursive<'select'>
  include?: TPrismaRecursive<'include'>
  where?: TPrismaWhereField
  orderBy?: TPrismaOrderBy
  take?: number
  skip?: number
  cursor?: TPrismaCursor
  distinct?: string
}
