import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
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
} from './types'
import {
  getRouteType,
  formatResourceId as formatResourceIdUtil,
  GetRouteType,
  getPaginationOptions,
  applyPaginationOptions,
  getResourceNameFromUrl,
  getAccessibleRoutes,
} from './utils'
import {
  getModelsAccessibleRoutes,
  getSwaggerPaths,
  getSwaggerTags,
} from './swagger/utils'
import { ApiError } from 'next/dist/server/api-utils'

type TCallback<T extends any = undefined> = (
  req: NextApiRequest,
  res: NextApiResponse,
  options?: T
) => void | Promise<void>
type TErrorCallback = (
  req: NextApiRequest,
  res: NextApiResponse,
  error: any
) => void | Promise<void>

interface INextCrudOptions<T, Q, M extends string = string> {
  adapter: IAdapter<T, Q, M>
  formatResourceId?: (resourceId: string) => string | number
  onRequest?: TCallback<GetRouteType & { resourceName: string }>
  onSuccess?: TCallback
  onError?: TErrorCallback
  middlewares?: TMiddleware<T>[]
  pagination?: IPaginationConfig
  models?: TModelsOptions<M>
  swagger?: TSwaggerConfig<M>
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

function NextCrud<T, Q = any, M extends string = string>({
  adapter,
  models,
  formatResourceId = formatResourceIdUtil,
  onRequest,
  onSuccess,
  onError,
  middlewares = [],
  pagination = defaultPaginationConfig,
  swagger = defaultSwaggerConfig,
}: INextCrudOptions<T, Q, M>): NextApiHandler<T> {
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
    const swaggerRoutes = getModelsAccessibleRoutes(adapter.getModels(), models)
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

  const handler: NextApiHandler = async (req, res) => {
    const { url, method, body } = req

    if (url.includes(swaggerConfig.path) && swaggerConfig.enabled) {
      res.status(200).json(swaggerJson)
      return
    }

    const { resourceName, modelName } = getResourceNameFromUrl(url, modelRoutes)

    if (!resourceName) {
      res.status(404)
      res.end()
      return
    }

    try {
      const { routeType, resourceId } = getRouteType({
        url,
        method,
        resourceName,
      })

      await onRequest?.(req, res, {
        routeType,
        resourceId,
        resourceName,
      })

      const modelConfig = models?.[resourceName]

      const accessibleRoutes = getAccessibleRoutes(
        modelConfig?.only,
        modelConfig?.exclude
      )

      if (!accessibleRoutes.includes(routeType)) {
        res.status(404).end()
        return
      }

      const parsedQuery = parseQuery(url.split('?')[1])

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
        response: res,
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
            case RouteType.READ_ONE:
              await getOneHandler({
                ...params,
                resourceId: resourceIdFormatted,
              })
              break
            case RouteType.READ_ALL: {
              await getAllHandler<T, Q>({
                ...params,
                paginated: isPaginated,
              })
              break
            }
            case RouteType.CREATE:
              await createHandler<T, Q>({ ...params, body })
              break
            case RouteType.UPDATE:
              await updateHandler<T, Q>({
                ...params,
                resourceId: resourceIdFormatted,
                body,
              })
              break
            case RouteType.DELETE:
              await deleteHandler<T, Q>({
                ...params,
                resourceId: resourceIdFormatted,
              })
              break
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

      await onSuccess?.(req, res)
    } catch (e) {
      await onError?.(req, res, e)
      if (e instanceof ApiError) {
        res.status(e.statusCode).send(e.message)
      } else {
        res.status(500).send(e.message)
      }
    } finally {
      await adapter.disconnect?.()
      res.end()
    }
  }
  return handler
}

export default NextCrud
