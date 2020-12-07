import { NextApiResponse } from 'next'

export enum RouteType {
  CREATE = 'CREATE',
  READ_ALL = 'READ_ALL',
  READ_ONE = 'READ_ONE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export interface IHandlerParams<T> {
  adapter: IAdapter<T>
  response: NextApiResponse
  query: IParsedQueryParams
}

export interface IUniqueResourceHandlerParams<T> extends IHandlerParams<T> {
  resourceId: string | number
}

export interface IAdapter<T, Q = IParsedQueryParams> {
  parseQuery(query?: IParsedQueryParams): Q
  getAll(query?: Q): Promise<T>
  getOne(resourceId: string | number, query?: Q): Promise<T>
  create(data: any, query?: Q): Promise<T>
  update(resourceId: string | number, data: any, query?: Q): Promise<T>
  delete(resourceId: string | number, query?: Q): Promise<T>
}

// Query parsing types

export type TRecursiveField = {
  [key: string]: boolean | TRecursiveField
}

export interface IParsedQueryParams {
  select?: TRecursiveField
  include?: TRecursiveField
}
