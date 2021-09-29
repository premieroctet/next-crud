// @ts-ignore
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { IPaginationConfig, TModelsOptions } from '.'
import {
  createHandler,
  deleteHandler,
  getAllHandler,
  getOneHandler,
  updateHandler,
} from './handlers'
import HttpError from './httpError'
import { parseQuery } from './queryParser'
import { IAdapter, IHandlerParams, RouteType, TMiddleware } from './types'
import {
  getRouteType,
  formatResourceId as formatResourceIdUtil,
  GetRouteType,
  getPaginationOptions,
  applyPaginationOptions,
  getResourceNameFromUrl,
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

interface INextCrudOptions<T, Q, M extends string = string> {
  adapter: IAdapter<T, Q, M>
  formatResourceId?: (resourceId: string) => string | number
  onRequest?: TCallback<GetRouteType & { resourceName: string }>
  onSuccess?: TCallback
  onError?: TErrorCallback
  middlewares?: TMiddleware<T>[]
  pagination?: IPaginationConfig
  models?: TModelsOptions<M>
}

const defaultPaginationConfig: IPaginationConfig = {
  perPage: 20,
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
}: INextCrudOptions<T, Q, M>): NextApiHandler<T> {
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

  const handler: NextApiHandler = async (req, res) => {
    const { url, method, body } = req

    const modelNames = adapter.getModels().map((modelName) => {
      return models?.[modelName]?.name ?? modelName
    })
    let resourceName = getResourceNameFromUrl(url, modelNames)

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

      let accessibleRoutes: RouteType[] = [
        RouteType.READ_ALL,
        RouteType.READ_ONE,
        RouteType.UPDATE,
        RouteType.DELETE,
        RouteType.CREATE,
      ]

      const modelConfig = models?.[resourceName]

      if (modelConfig?.only?.length) {
        accessibleRoutes = accessibleRoutes.filter((elem) => {
          return modelConfig.only?.includes(elem)
        })
      }

      if (modelConfig?.exclude?.length) {
        accessibleRoutes = accessibleRoutes.filter((elem) => {
          return !modelConfig?.exclude?.includes(elem)
        })
      }

      await onRequest?.(req, res, {
        routeType,
        resourceId,
        resourceName,
      })

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

      // If resource name is part of the models config, we should revert it to the original model name
      if (models) {
        const originalModel = Object.keys(models).find(
          (model) => models[model]?.name === resourceName
        )
        if (originalModel) {
          resourceName = originalModel
        }
      }

      const params: IHandlerParams<T, Q> = {
        request: req,
        response: res,
        adapter,
        query: adapter.parseQuery(resourceName as M, parsedQuery),
        middlewares,
        resourceName,
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
