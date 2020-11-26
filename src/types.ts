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

export interface IHandlerParams<T> {
  prismaDelegate: Record<PrismaAction, (...args: any[]) => Promise<T>>
  response: NextApiResponse
}

export interface IUniqueResourceHandlerParams<T> extends IHandlerParams<T> {
  resourceId: string | number
  primaryKey: string
}
