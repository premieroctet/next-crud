// @ts-ignore
import { NextApiHandler } from 'next'
import {
  createHandler,
  deleteHandler,
  getAllHandler,
  getOneHandler,
  updateHandler,
} from './handlers'
import { parseQuery } from './queryParser'
import { IAdapter, IHandlerParams, RouteType } from './types'
import { getRouteType, formatResourceId as formatResourceIdUtil } from './utils'

interface INextCrudOptions<T, Q> {
  adapter: IAdapter<T, Q>
  resourceName: string
  formatResourceId?: (resourceId: string) => string | number
}

function NextCrud<T, Q = any>({
  adapter,
  resourceName,
  formatResourceId = formatResourceIdUtil,
}: INextCrudOptions<T, Q>): NextApiHandler<T> {
  const handler: NextApiHandler = async (req, res) => {
    const { url, method, body } = req

    try {
      const { routeType, resourceId } = getRouteType({
        url,
        method,
        resourceName,
      })

      const parsedQuery = parseQuery(url.split('?')[1])

      const params: IHandlerParams<T, Q> = {
        response: res,
        adapter,
        query: adapter.parseQuery(parsedQuery),
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
    } catch (e) {
      res.status(500).send(e.message)
    } finally {
      res.end()
    }
  }
  return handler
}

export default NextCrud
