// @ts-ignore
import { PrismaClient, PrismaAction, PrismaClientOptions } from '@prisma/client'
import { IAdapter, IParsedQueryParams } from '../types'

export default class PrismaAdapter<T> implements IAdapter<T> {
  private prismaDelegate: Record<PrismaAction, (...args: any[]) => Promise<T>>
  private primaryKey: string

  constructor(
    modelName: keyof PrismaClient,
    primaryKey = 'id',
    options?: PrismaClientOptions
  ) {
    const prisma = new PrismaClient(options)
    this.prismaDelegate = prisma[modelName]
    this.primaryKey = primaryKey
  }

  async getAll(query?: IParsedQueryParams): Promise<T> {
    const results = await this.prismaDelegate.findMany({
      select: query.select,
    })

    return results
  }

  async getOne(
    resourceId: string | number,
    query?: IParsedQueryParams
  ): Promise<T> {
    /**
     * On prisma v2.12, findOne has been deprecated in favor of findUnique
     * We use findUnique in priority only if it's available
     */
    const findFn = this.prismaDelegate.findUnique || this.prismaDelegate.findOne

    const resource = await findFn({
      where: {
        [this.primaryKey]: resourceId,
      },
      select: query.select,
    })

    return resource
  }

  async create(data: any, query?: IParsedQueryParams): Promise<T> {
    const createdResource = await this.prismaDelegate.create({
      data,
      select: query.select,
    })

    return createdResource
  }

  async update(
    resourceId: string | number,
    data: any,
    query?: IParsedQueryParams
  ): Promise<T> {
    const updatedResource = await this.prismaDelegate.update({
      where: {
        [this.primaryKey]: resourceId,
      },
      data,
      select: query.select,
    })

    return updatedResource
  }

  async delete(
    resourceId: string | number,
    query?: IParsedQueryParams
  ): Promise<T> {
    const deletedResource = await this.prismaDelegate.delete({
      where: {
        [this.primaryKey]: resourceId,
      },
      select: query.select,
    })

    return deletedResource
  }
}
