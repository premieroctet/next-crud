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

interface INextCrudOptions<T> {
  adapter: IAdapter<T>
  resourceName: string
  formatResourceId?: (resourceId: string) => string | number
}

function NextCrud<T>({
  adapter,
  resourceName,
  formatResourceId = formatResourceIdUtil,
}: INextCrudOptions<T>): NextApiHandler<T> {
  const handler: NextApiHandler = async (req, res) => {
    const { url, method, body } = req

    try {
      const { routeType, resourceId } = getRouteType({
        url,
        method,
        resourceName,
      })

      const parsedQuery = parseQuery(url.split('?')[1])

      const params: IHandlerParams<T> = {
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
          await getAllHandler<T>(params)
          break
        case RouteType.CREATE:
          await createHandler<T>({ ...params, body })
          break
        case RouteType.UPDATE:
          await updateHandler({
            ...params,
            resourceId: resourceIdFormatted,
            body,
          })
          break
        case RouteType.DELETE:
          await deleteHandler({
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
