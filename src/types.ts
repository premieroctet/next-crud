import { NextApiRequest, NextApiResponse } from 'next'

export enum RouteType {
  CREATE = 'CREATE',
  READ_ALL = 'READ_ALL',
  READ_ONE = 'READ_ONE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export interface IHandlerConfig {
  pagination?: IPaginationConfig
  swagger?: TSwaggerConfig
}

export interface IPathsOptions {
  /**
   * Resource name of the path, eg: users
   */
  resourceName: string
  /**
   * Base path of the CRUD, eg: /api/users
   */
  basePath: string
  /**
   * Route types that should be catched
   */
  only?: RouteType[]
  /**
   * Route types that should not be catched
   */
  exclude?: RouteType[]
  formatResourceId?: (resourceId: string) => string | number
}

export interface IHandlerParams<T, Q> {
  adapter: IAdapter<T, Q>
  request: NextApiRequest
  response: NextApiResponse
  query: Q
  middlewares: TMiddleware<T>[]
}

export interface IUniqueResourceHandlerParams<T, Q>
  extends IHandlerParams<T, Q> {
  resourceId: string | number
  resourceName: string
}

export interface IAdapter<T, Q> {
  parseQuery(query?: IParsedQueryParams): Q
  getAll(query?: Q): Promise<T[]>
  getOne(resourceId: string | number, query?: Q): Promise<T>
  create(data: any, query?: Q): Promise<T>
  update(resourceId: string | number, data: any, query?: Q): Promise<T>
  delete(resourceId: string | number, query?: Q): Promise<T>
  getPaginationData(query: Q): Promise<TPaginationData>
  connect?: () => Promise<void>
  disconnect?: () => Promise<void>
  handleError?: (err: Error) => void
}

export type TMiddlewareContext<T> = {
  req: NextApiRequest
  res: NextApiResponse
  result: T
}

export type TMiddleware<T> = (
  ctx: TMiddlewareContext<T>,
  next: () => void
) => void

// Query parsing types

export type TRecursiveField = {
  [key: string]: boolean | TRecursiveField
}

export type TWhereOperator =
  | '$eq'
  | '$neq'
  | '$in'
  | '$notin'
  | '$lt'
  | '$lte'
  | '$gt'
  | '$gte'
  | '$cont'
  | '$starts'
  | '$ends'
  | '$isnull'

export type TSearchCondition = string | boolean | number | Date | null

export type TWhereCondition = {
  [key in TWhereOperator]?: TSearchCondition
}

export type TCondition = {
  [key: string]: TSearchCondition | TWhereCondition | TCondition
}

export type TWhereField = TCondition & {
  $and?: TCondition | TCondition[]
  $or?: TCondition | TCondition[]
  $not?: TCondition | TCondition[]
}

export type TOrderByOperator = '$asc' | '$desc'

export type TOrderByField = {
  [key: string]: TOrderByOperator
}

export interface IParsedQueryParams {
  select?: TRecursiveField
  include?: TRecursiveField
  where?: TWhereField
  orderBy?: TOrderByField
  limit?: number
  skip?: number
  distinct?: string
  page?: number
  originalQuery?: {
    [key: string]: any
  }
}

export type TPageBasedPagination = {
  page: number
  perPage: number
}

export type TPaginationOptions = TPageBasedPagination

export interface IPaginationConfig {
  perPage: number
}

export type TPaginationDataPageBased = {
  total: number
  pageCount: number
  page: number
}

export type TPaginationData = TPaginationDataPageBased

export type TPaginationResult<T> = {
  data: T[]
  pagination: TPaginationData
}

export type TSwaggerType = {
  name: string
  type: () => any
  isArray?: boolean
  description?: string
  required?: boolean
}

export type TSwaggerOperation = {
  summary?: string
  responses?: Record<number, any>
  body?: TSwaggerType
  response: TSwaggerType
}

export type TSwaggerConfig = {
  enabled?: boolean
  tag?: {
    name?: string
    description?: string
    externalDocs?: {
      description: string
      url: string
    }
  }
  type: TSwaggerType
  routeTypes?: {
    [RouteType.READ_ALL]?: TSwaggerOperation
    [RouteType.READ_ONE]?: TSwaggerOperation
    [RouteType.CREATE]?: TSwaggerOperation
    [RouteType.UPDATE]?: TSwaggerOperation
    [RouteType.DELETE]?: TSwaggerOperation
  }
  additionalQueryParams?: TSwaggerType[]
}
