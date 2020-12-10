// @ts-ignore
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import {
  createHandler,
  deleteHandler,
  getAllHandler,
  getOneHandler,
  updateHandler,
} from './handlers'
import { parseQuery } from './queryParser'
import { IAdapter, IHandlerParams, RouteType, TMiddleware } from './types'
import { getRouteType, formatResourceId as formatResourceIdUtil } from './utils'

type TCallback = (
  req: NextApiRequest,
  res: NextApiResponse
) => void | Promise<void>
type TErrorCallback = (
  req: NextApiRequest,
  res: NextApiResponse,
  error: any
) => void | Promise<void>

interface INextCrudOptions<T, Q> {
  adapter: IAdapter<T, Q>
  resourceName: string
  formatResourceId?: (resourceId: string) => string | number
  onRequest?: TCallback
  onSuccess?: TCallback
  onError?: TErrorCallback
  middlewares?: TMiddleware<T>[]
  only?: RouteType[]
  exclude?: RouteType[]
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
}: INextCrudOptions<T, Q>): NextApiHandler<T> {
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

      await onRequest?.(req, res)

      if (!accessibleRoutes.includes(routeType)) {
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

      switch (routeType) {
        case RouteType.READ_ONE:
          await getOneHandler({
            ...params,
            resourceId: resourceIdFormatted,
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
            body,
          })
          break
        case RouteType.DELETE:
          await deleteHandler<T, Q>({
            ...params,
            resourceId: resourceIdFormatted,
          })
          break
        case null:
          res.status(404)
          break
      }

      await onSuccess?.(req, res)
    } catch (e) {
      await onError?.(req, res, e)
      res.status(500).send(e.message)
    } finally {
      res.end()
    }
  }
  return handler
}

export default NextCrud
