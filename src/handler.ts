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
import { IAdapter, IHandlerParams, RouteType, TMiddleware } from './types'
import { getRouteType, formatResourceId as formatResourceIdUtil, GetRouteType } from './utils'

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
  adapter: IAdapter<T, Q>
}

interface ICustomHandler<T, Q> {
  path: string | RegExp | Array<string | RegExp>
  handler: (params: ICustomHandlerParams<T, Q>) => void | Promise<void>
  methods?: string[]
}

interface INextCrudOptions<T, Q> {
  adapter: IAdapter<T, Q>
  resourceName: string
  formatResourceId?: (resourceId: string) => string | number
  onRequest?: TCallback<GetRouteType>
  onSuccess?: TCallback
  onError?: TErrorCallback
  middlewares?: TMiddleware<T>[]
  only?: RouteType[]
  exclude?: RouteType[]
  customHandlers?: ICustomHandler<T, Q>[]
}

function NextCrud<T, Q = any>({
  adapter,
  resourceName,
  formatResourceId = formatResourceIdUtil,
  onRequest,
  onSuccess,
  onError,
  middlewares = [],
  only = [],
  exclude = [],
  customHandlers = [],
}: INextCrudOptions<T, Q>): NextApiHandler<T> {
  if (
    !adapter.create ||
    !adapter.delete ||
    !adapter.getAll ||
    !adapter.getOne ||
    !adapter.parseQuery ||
    !adapter.update
  ) {
    throw new Error('missing method in adapter')
  }

  const handler: NextApiHandler = async (req, res) => {
    const { url, method, body } = req

    let accessibleRoutes: RouteType[] = [
      RouteType.READ_ALL,
      RouteType.READ_ONE,
      RouteType.UPDATE,
      RouteType.DELETE,
      RouteType.CREATE,
    ]

    if (only.length) {
      accessibleRoutes = accessibleRoutes.filter((elem) => {
        return only.includes(elem)
      })
    }

    if (exclude.length) {
      accessibleRoutes = accessibleRoutes.filter((elem) => {
        return !exclude.includes(elem)
      })
    }

    try {
      const { routeType, resourceId } = getRouteType({
        url,
        method,
        resourceName,
      })

      await onRequest?.(req, res, { routeType, resourceId })

      if (!accessibleRoutes.includes(routeType) && !customHandlers.length) {
        res.status(404).end()
        return
      }

      const parsedQuery = parseQuery(url.split('?')[1])

      const params: IHandlerParams<T, Q> = {
        request: req,
        response: res,
        adapter,
        query: adapter.parseQuery(parsedQuery),
        middlewares,
      }

      const resourceIdFormatted = formatResourceId(resourceId)

      const executeCrud = async () => {
        try {
          switch (routeType) {
            case RouteType.READ_ONE:
              await getOneHandler({
                ...params,
                resourceId: resourceIdFormatted,
                resourceName,
              })
              break
            case RouteType.READ_ALL:
              await getAllHandler<T, Q>(params)
              break
            case RouteType.CREATE:
              await createHandler<T, Q>({ ...params, body })
              break
            case RouteType.UPDATE:
              await updateHandler<T, Q>({
                ...params,
                resourceId: resourceIdFormatted,
                resourceName,
                body,
              })
              break
            case RouteType.DELETE:
              await deleteHandler<T, Q>({
                ...params,
                resourceId: resourceIdFormatted,
                resourceName,
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
            adapter,
          })
        } else {
          await executeCrud()
        }
      } else {
        await executeCrud()
      }

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
