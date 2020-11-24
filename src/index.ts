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
import { RouteType } from './types'
import { getRouteType } from './utils'

const prisma = new PrismaClient()

interface INextCrudOptions {
  modelName: keyof typeof prisma
  resourceName: string
}

function NextCrud<T, U>({
  modelName,
  resourceName,
}: INextCrudOptions): NextApiHandler<U> {
  const handler: NextApiHandler = (req, res) => {
    if (modelName in prisma) {
      const db = prisma[modelName] as Record<PrismaAction, () => Promise<T>>

      const { url, method, query } = req

      try {
        const { routeType } = getRouteType({
          url,
          method,
          resourceName,
        })

        switch (routeType) {
          case RouteType.READ_ONE:
            getOneHandler({ prismaDelegate: db, response: res })
            break
          case RouteType.READ_ALL:
            getAllHandler({ prismaDelegate: db, response: res })
            break
          case RouteType.CREATE:
            createHandler({ prismaDelegate: db, response: res })
            break
          case RouteType.UPDATE:
            updateHandler({ prismaDelegate: db, response: res })
            break
          case RouteType.DELETE:
            deleteHandler({ prismaDelegate: db, response: res })
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
