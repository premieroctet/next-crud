import { NextApiRequest, NextApiResponse } from 'next'

export enum RouteType {
  CREATE = 'CREATE',
  READ_ALL = 'READ_ALL',
  READ_ONE = 'READ_ONE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export type TModelOption = {
  name?: string
  only?: RouteType[]
  exclude?: RouteType[]
  formatResourceId?: (resourceId: string) => string | number
}

export type TModelsOptions<M extends string = string> = {
  [key in M]?: TModelOption
}

export interface IHandlerParams<T, Q> {
  adapter: IAdapter<T, Q>
  request: NextApiRequest
  response: NextApiResponse
  query: Q
  middlewares: TMiddleware<T>[]
  resourceName: string
}

export interface IUniqueResourceHandlerParams<T, Q>
  extends IHandlerParams<T, Q> {
  resourceId: string | number
  resourceName: string
}

export interface IAdapter<T, Q, M extends string = string> {
  models: M[]
  parseQuery(resourceName: M, query?: IParsedQueryParams): Q
  getAll(resourceName: M, query?: Q): Promise<T[]>
  getOne(resourceName: M, resourceId: string | number, query?: Q): Promise<T>
  create(resourceName: M, data: any, query?: Q): Promise<T>
  update(
    resourceName: M,
    resourceId: string | number,
    data: any,
    query?: Q
  ): Promise<T>
  delete(resourceName: M, resourceId: string | number, query?: Q): Promise<T>
  getPaginationData(resourceName: M, query: Q): Promise<TPaginationData>
  connect?: () => Promise<void>
  disconnect?: () => Promise<void>
  handleError?: (err: Error) => void
  getModels(): M[]
  getModelsJsonSchema?: () => any
  mapModelsToRouteNames?: () => { [key in M]?: string }
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

export type TSwaggerTag = {
  name?: string
  description?: string
  externalDocs?: {
    description: string
    url: string
  }
}

export type TSwaggerParameter = {
  name: string
  description?: string
  schema: {
    type: string
  } & any
}

export type TSwaggerModelsConfig<M extends string> = {
  [key in M]?: {
    tag: TSwaggerTag
    type?: TSwaggerType
    routeTypes?: {
      [RouteType.READ_ALL]?: TSwaggerOperation
      [RouteType.READ_ONE]?: TSwaggerOperation
      [RouteType.CREATE]?: TSwaggerOperation
      [RouteType.UPDATE]?: TSwaggerOperation
      [RouteType.DELETE]?: TSwaggerOperation
    }
    additionalQueryParams?: TSwaggerParameter[]
  }
}

export type TSwaggerConfig<M extends string> = {
  title?: string
  enabled?: boolean
  path?: string
  apiUrl: string
  config?: TSwaggerModelsConfig<M>
}
