// @ts-ignore
import { PrismaClient, PrismaAction } from '@prisma/client'
import { NextApiHandler } from 'next'
import {
  createHandler,
  deleteHandler,
  getAllHandler,
  getOneHandler,
  updateHandler,
} from './handlers'
import { IHandlerParams, RouteType } from './types'
import { getRouteType, formatResourceId as formatResourceIdUtil } from './utils'

interface INextCrudOptions {
  modelName: keyof PrismaClient
  resourceName: string
  primaryKey?: string
  formatResourceId?: (resourceId: string) => string | number
}

function NextCrud<T>({
  modelName,
  resourceName,
  primaryKey = 'id',
  formatResourceId = formatResourceIdUtil,
}: INextCrudOptions): NextApiHandler<T> {
  const handler: NextApiHandler = async (req, res) => {
    const prisma = new PrismaClient()

    if (modelName in prisma) {
      const db = prisma[modelName] as Record<PrismaAction, () => Promise<T>>

      const { url, method, query, body } = req

      try {
        const { routeType, resourceId } = getRouteType({
          url,
          method,
          resourceName,
        })

        const params: IHandlerParams<T> = {
          prismaDelegate: db,
          response: res,
        }

        const resourceIdFormatted = formatResourceId(resourceId)

        switch (routeType) {
          case RouteType.READ_ONE:
            await getOneHandler({
              ...params,
              resourceId: resourceIdFormatted,
              primaryKey,
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
              primaryKey,
              body,
            })
            break
          case RouteType.DELETE:
            await deleteHandler({
              ...params,
              resourceId: resourceIdFormatted,
              primaryKey,
            })
            break
          case null:
            res.status(404)
            break
        }
      } catch (e) {
        res.status(500).send(e)
      } finally {
        res.end()
      }
    } else {
      throw new Error('modelName must be part of your prisma object')
    }
  }
  return handler
}

export default NextCrud
