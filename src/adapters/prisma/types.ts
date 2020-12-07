export type TPrismaRecursiveField = 'select' | 'include'

export type TPrismaRecursive<T extends TPrismaRecursiveField> = Record<
  string,
  boolean | { [key in T]: TPrismaRecursive<T> }
>

export interface IPrismaParsedQueryParams {
  select?: TPrismaRecursive<'select'>
  include?: TPrismaRecursive<'include'>
}
