import { NextApiRequest, NextApiResponse } from 'next'
import {
  createHandler,
  deleteHandler,
  getAllHandler,
  getOneHandler,
  updateHandler,
} from './handlers'
import { parseQuery } from './queryParser'
import {
  IAdapter,
  IHandlerParams,
  RouteType,
  TMiddleware,
  IPaginationConfig,
  TModelsOptions,
  TSwaggerConfig,
  TDefaultExposeStrategy,
  TInternalRequest,
} from './types'
import {
  getRouteType,
  formatResourceId as formatResourceIdUtil,
  GetRouteType,
  getPaginationOptions,
  applyPaginationOptions,
  getResourceNameFromUrl,
  getAccessibleRoutes,
  toRequest,
} from './utils'
import {
  getModelsAccessibleRoutes,
  getSwaggerPaths,
  getSwaggerTags,
} from './swagger/utils'
import { ApiError } from 'next/dist/server/api-utils'

type TCallback<T = undefined, Res = void> = (
  req: TInternalRequest,
  options?: T
) => Res | Promise<Res>
type TErrorCallback = (
  req: TInternalRequest,
  error: Error
) => void | Promise<void>

interface INextCrudOptions<T, Q, M extends string = string> {
  adapter: IAdapter<T, Q, M>
  formatResourceId?: (resourceId: string) => string | number
  onRequest?: TCallback<
    GetRouteType & { resourceName: string },
    Response | undefined
  >
  onSuccess?: TCallback
  onError?: TErrorCallback
  middlewares?: TMiddleware<T>[]
  pagination?: IPaginationConfig
  models?: TModelsOptions<M>
  swagger?: TSwaggerConfig<M>
  defaultExposeStrategy?: TDefaultExposeStrategy
}

const defaultPaginationConfig: IPaginationConfig = {
  perPage: 20,
}

const defaultSwaggerConfig: TSwaggerConfig<string> = {
  enabled: process.env.NODE_ENV === 'development',
  path: '/api/docs',
  title: 'CRUD API',
  apiUrl: '',
}

type CrudApiHandler = (
  req: NextApiRequest | Request,
  res?: NextApiResponse
) => Promise<Response | void>

async function NextCrud<T, Q, M extends string = string>({
  adapter,
  models,
  formatResourceId = formatResourceIdUtil,
  onRequest,
  onSuccess,
  onError,
  middlewares = [],
  pagination = defaultPaginationConfig,
  swagger = defaultSwaggerConfig,
  defaultExposeStrategy = 'all',
}: INextCrudOptions<T, Q, M>): Promise<CrudApiHandler> {
  if (
    !adapter.create ||
    !adapter.delete ||
    !adapter.getAll ||
    !adapter.getOne ||
    !adapter.parseQuery ||
    !adapter.update ||
    !adapter.getPaginationData ||
    !adapter.getModels
  ) {
    throw new Error('missing method in adapter')
  }

  await adapter.init?.()

  const routeNames = adapter.mapModelsToRouteNames?.()
  const modelRoutes: { [key in M]?: string } = {}
  for (const modelName of adapter.getModels()) {
    modelRoutes[modelName] =
      models?.[modelName]?.name || routeNames?.[modelName] || modelName
  }

  let swaggerJson
  const swaggerConfig = {
    ...defaultSwaggerConfig,
    ...swagger,
  }

  if (swaggerConfig?.enabled) {
    const swaggerRoutes = getModelsAccessibleRoutes(
      adapter.getModels(),
      models,
      defaultExposeStrategy
    )
    const swaggerTags = getSwaggerTags(
      adapter.getModels(),
      swaggerConfig.config
    )
    const swaggerPaths = getSwaggerPaths({
      routes: swaggerRoutes,
      modelsConfig: swaggerConfig?.config,
      models,
      routesMap: routeNames,
    })

    swaggerJson = {
      openapi: '3.0.1',
      info: {
        title: swaggerConfig.title,
        version: '1.0',
      },
      servers: [{ url: swaggerConfig.apiUrl }],
      tags: swaggerTags,
      paths: swaggerPaths,
    }

    if (adapter.getModelsJsonSchema) {
      swaggerJson.components = {
        schemas: adapter.getModelsJsonSchema(),
      }
    }
  }

  const NextCrudBaseHandler = async (
    req: TInternalRequest
  ): Promise<Response> => {
    if (req.url.includes(swaggerConfig.path) && swaggerConfig.enabled) {
      return Response.json(swaggerJson, { status: 200 })
    }

    const { resourceName, modelName } = getResourceNameFromUrl(
      req.url,
      modelRoutes
    )

    if (!resourceName) {
      return Response.json({ message: 'Resource not found' }, { status: 404 })
    }

    let response: Response

    try {
      const { routeType, resourceId } = getRouteType({
        url: req.url,
        method: req.method,
        resourceName,
      })

      const onRequestResponse = await onRequest?.(req, {
        routeType,
        resourceId,
        resourceName,
      })

      if (onRequestResponse) {
        return onRequestResponse
      }

      const modelConfig = models?.[modelName]

      const accessibleRoutes = getAccessibleRoutes(
        modelConfig?.only,
        modelConfig?.exclude,
        defaultExposeStrategy
      )

      if (!accessibleRoutes.includes(routeType)) {
        return Response.json({ message: 'Resource not found' }, { status: 404 })
      }

      const parsedQuery = parseQuery(req.url.split('?')[1])

      let isPaginated = false

      if (routeType === RouteType.READ_ALL) {
        const paginationOptions = getPaginationOptions(parsedQuery, pagination)

        if (paginationOptions) {
          isPaginated = true
          applyPaginationOptions(parsedQuery, paginationOptions)
        }
      }

      const params: IHandlerParams<T, Q> = {
        request: req,
        adapter,
        query: adapter.parseQuery(modelName as M, parsedQuery),
        middlewares,
        resourceName: modelName,
      }

      const resourceIdFormatted =
        modelConfig?.formatResourceId?.(resourceId) ??
        formatResourceId(resourceId)

      const executeCrud = async () => {
        try {
          switch (routeType) {
            case RouteType.READ_ONE: {
              const data = await getOneHandler({
                ...params,
                resourceId: resourceIdFormatted,
              })

              response = Response.json(data, { status: 200 })
              break
            }
            case RouteType.READ_ALL: {
              const data = await getAllHandler<T, Q>({
                ...params,
                paginated: isPaginated,
              })
              response = Response.json(data, { status: 200 })
              break
            }
            case RouteType.CREATE: {
              const data = await createHandler<T, Q>({
                ...params,
                body: req.body as Partial<T>,
              })

              response = Response.json(data, { status: 201 })
              break
            }
            case RouteType.UPDATE: {
              const data = await updateHandler<T, Q>({
                ...params,
                resourceId: resourceIdFormatted,
                body: req.body as Partial<T>,
              })

              response = Response.json(data, { status: 200 })
              break
            }
            case RouteType.DELETE: {
              const data = await deleteHandler<T, Q>({
                ...params,
                resourceId: resourceIdFormatted,
              })

              response = Response.json(data, { status: 200 })
              break
            }
          }
        } catch (e) {
          if (adapter.handleError && !(e instanceof ApiError)) {
            adapter.handleError(e)
          } else {
            throw e
          }
        }
      }

      await adapter.connect?.()

      await executeCrud()

      await onSuccess?.(req)
    } catch (e) {
      await onError?.(req, e)
      if (e instanceof ApiError) {
        response = Response.json(
          { message: e.message },
          { status: e.statusCode }
        )
      } else {
        response = Response.json({ message: e.message }, { status: 500 })
      }
    } finally {
      await adapter.disconnect?.()
    }

    return response
  }

  const handler = async (
    req: NextApiRequest | Request,
    res?: NextApiResponse
  ) => {
    if (res) {
      const response = await NextCrudBaseHandler(
        await toRequest(req as NextApiRequest)
      )

      const bodyResponse = await response.json()

      return res.status(response.status).json(bodyResponse)
    } else {
      const response = await NextCrudBaseHandler(
        await toRequest(req as Request)
      )

      return response
    }
  }
  return handler
}

export default NextCrud
