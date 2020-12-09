import type { TSearchCondition } from '../../types'

export type TPrismaRecursiveField = 'select' | 'include'

export type TPrismaRecursive<T extends TPrismaRecursiveField> = Record<
  string,
  boolean | { [key in T]: TPrismaRecursive<T> }
>

export type TPrismaOperator =
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

export type TPrismaFieldFilterOperator = {
  [key in TPrismaOperator]?: TSearchCondition
}

export type TPrismaFieldFilter = {
  [key: string]: TSearchCondition | TPrismaFieldFilterOperator
}

export type TPrismaWhereField = TPrismaFieldFilter & {
  AND?: TPrismaFieldFilter
  OR?: TPrismaFieldFilter
  NOT?: TPrismaFieldFilter
}

export interface IPrismaParsedQueryParams {
  select?: TPrismaRecursive<'select'>
  include?: TPrismaRecursive<'include'>
  where?: TPrismaWhereField
}
