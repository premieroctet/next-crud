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

export interface IAdapter<T> {
  getAll(query?: IParsedQueryParams): Promise<T>
  getOne(resourceId: string | number, query?: IParsedQueryParams): Promise<T>
  create(data: any, query?: IParsedQueryParams): Promise<T>
  update(
    resourceId: string | number,
    data: any,
    query?: IParsedQueryParams
  ): Promise<T>
  delete(resourceId: string | number, query?: IParsedQueryParams): Promise<T>
}

// Query parsing types

export type TSelect = {
  [key: string]: boolean | TSelect
}

export interface IParsedQueryParams {
  select?: TSelect
}
