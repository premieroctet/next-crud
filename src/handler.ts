// @ts-ignore
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { match } from 'path-to-regexp'
import {
  createHandler,
  deleteHandler,
  getAllHandler,
  getOneHandler,
  updateHandler,
} from './handlers'
import HttpError from './httpError'
import { parseQuery } from './queryParser'
import generateSwaggerForModel from './swagger/generateSwaggerForModel'
import {
  IAdapter,
  IHandlerParams,
  RouteType,
  TMiddleware,
  IHandlerConfig,
  IPathsOptions,
} from './types'
import {
  getRouteType,
  formatResourceId as formatResourceIdUtil,
  GetRouteType,
  getPaginationOptions,
  applyPaginationOptions,
  getPathDataFromUrl,
} from './utils'

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

interface ICustomHandlerParams<T, Q> {
  req: NextApiRequest
  res: NextApiResponse<T>
}

interface ICustomHandler<T, Q> {
  path: string | RegExp | Array<string | RegExp>
  handler: (params: ICustomHandlerParams<T, Q>) => void | Promise<void>
  methods?: string[]
}

interface INextCrudOptions<T, Q> {
  adapterFactory: (resourceName: string) => IAdapter<T, Q>
  formatResourceId?: (resourceId: string) => string | number
  onRequest?: TCallback<GetRouteType & { resourceName: string }>
  onSuccess?: TCallback
  onError?: TErrorCallback
  middlewares?: TMiddleware<T>[]
  customHandlers?: ICustomHandler<T, Q>[]
  config?: IHandlerConfig
  paths: IPathsOptions[]
}

const defaultConfig: IHandlerConfig = {
  pagination: {
    perPage: 20,
  },
}

function NextCrud<T, Q = any>({
  adapterFactory,
  formatResourceId = formatResourceIdUtil,
  onRequest,
  onSuccess,
  onError,
  middlewares = [],
  customHandlers = [],
  config = defaultConfig,
  paths,
}: INextCrudOptions<T, Q>): NextApiHandler<T> {
  // if (config.swagger?.enabled) {
  //   const swaggerRoutes = accessibleRoutes.reduce((acc, val) => {
  //     if (config.swagger.routeTypes[val]) {
  //       return {
  //         ...acc,
  //         [val]: config.swagger.routeTypes[val],
  //       }
  //     }

  //     return acc
  //   }, {})

  //   generateSwaggerForModel({
  //     tag: config.swagger.tag,
  //     routes: swaggerRoutes,
  //     type: config.swagger.type,
  //     queryParams: [...config.swagger.additionalQueryParams],
  //     enabledRoutes: accessibleRoutes,
  //     resourceName,
  //   })
  // }

  const handler: NextApiHandler = async (req, res) => {
    const { url, method, body } = req

    if (customHandlers.length) {
      const realPath = url.split('?')[0]
      const customHandler = customHandlers.find(
        ({ path, methods: customHandlerMethods = ['GET'] }) => {
          const matcher = match(path, {
            decode: decodeURIComponent,
          })

          return !!matcher(realPath) && customHandlerMethods.includes(method)
        }
      )

      if (customHandler) {
        await customHandler.handler({
          req,
          res,
        })
        return
      }
    }

    const path = getPathDataFromUrl(url, paths)
    if (!path) {
      res.status(404)
      res.end()
      return
    }
    const adapter = adapterFactory(path.resourceName)

    try {
      if (
        !adapter.create ||
        !adapter.delete ||
        !adapter.getAll ||
        !adapter.getOne ||
        !adapter.parseQuery ||
        !adapter.update ||
        !adapter.getPaginationData
      ) {
        throw new Error('missing method in adapter')
      }

      const { routeType, resourceId } = getRouteType({
        url,
        method,
        resourceName: path.resourceName,
      })

      let accessibleRoutes: RouteType[] = [
        RouteType.READ_ALL,
        RouteType.READ_ONE,
        RouteType.UPDATE,
        RouteType.DELETE,
        RouteType.CREATE,
      ]

      if (path.only?.length) {
        accessibleRoutes = accessibleRoutes.filter((elem) => {
          return path.only?.includes(elem)
        })
      }

      if (path.exclude?.length) {
        accessibleRoutes = accessibleRoutes.filter((elem) => {
          return !path.exclude?.includes(elem)
        })
      }

      await onRequest?.(req, res, {
        routeType,
        resourceId,
        resourceName: path.resourceName,
      })

      if (!accessibleRoutes.includes(routeType) && !customHandlers.length) {
        res.status(404).end()
        return
      }

      const parsedQuery = parseQuery(url.split('?')[1])

      let isPaginated = false

      if (routeType === RouteType.READ_ALL) {
        const pagination = getPaginationOptions(parsedQuery, config.pagination)

        if (pagination) {
          isPaginated = true
          applyPaginationOptions(parsedQuery, pagination)
        }
      }

      const params: IHandlerParams<T, Q> = {
        request: req,
        response: res,
        adapter,
        query: adapter.parseQuery(parsedQuery),
        middlewares,
      }

      const resourceIdFormatted =
        path.formatResourceId?.(resourceId) ?? formatResourceId(resourceId)

      const executeCrud = async () => {
        try {
          switch (routeType) {
            case RouteType.READ_ONE:
              await getOneHandler({
                ...params,
                resourceId: resourceIdFormatted,
                resourceName: path.resourceName,
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
                resourceName: path.resourceName,
                body,
              })
              break
            case RouteType.DELETE:
              await deleteHandler<T, Q>({
                ...params,
                resourceId: resourceIdFormatted,
                resourceName: path.resourceName,
              })
              break
          }
        } catch (e) {
          if (adapter.handleError && !(e instanceof HttpError)) {
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
      if (e instanceof HttpError) {
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
