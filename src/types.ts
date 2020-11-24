// @ts-ignore
import type { PrismaAction } from '@prisma/client'
import { NextApiResponse } from 'next'

export enum RouteType {
  CREATE = 'CREATE',
  READ_ALL = 'READ_ALL',
  READ_ONE = 'READ_ONE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export interface HandlerParams<T> {
  prismaDelegate: Record<PrismaAction, () => Promise<T>>
  response: NextApiResponse
}
