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
import { getRouteType } from './utils'

interface INextCrudOptions {
  modelName: keyof PrismaClient
  resourceName: string
  primaryKey?: string
}

function NextCrud<T>({
  modelName,
  resourceName,
  primaryKey = 'id',
}: INextCrudOptions): NextApiHandler<T> {
  const handler: NextApiHandler = async (req, res) => {
    const prisma = new PrismaClient()

    if (modelName in prisma) {
      const db = prisma[modelName] as Record<PrismaAction, () => Promise<T>>

      const { url, method, query, body } = req

      try {
        const { routeType } = getRouteType({
          url,
          method,
          resourceName,
        })

        const params: IHandlerParams<T> = {
          prismaDelegate: db,
          response: res,
        }

        switch (routeType) {
          case RouteType.READ_ONE:
            getOneHandler(params)
            break
          case RouteType.READ_ALL:
            await getAllHandler<T>(params)
            break
          case RouteType.CREATE:
            await createHandler<T>({ ...params, body })
            break
          case RouteType.UPDATE:
            updateHandler(params)
            break
          case RouteType.DELETE:
            deleteHandler(params)
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
