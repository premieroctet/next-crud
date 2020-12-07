// @ts-ignore
import { PrismaClient, PrismaAction, PrismaClientOptions } from '@prisma/client'
import { IAdapter, IParsedQueryParams } from '../../types'
import { IPrismaParsedQueryParams } from './types'
import { parsePrismaRecursiveField } from './utils'

export default class PrismaAdapter<T>
  implements IAdapter<T, IPrismaParsedQueryParams> {
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

  parseQuery(query?: IParsedQueryParams) {
    // @ts-ignore
    const parsed: IPrismaParsedQueryParams = {}

    if (query.select) {
      parsed.select = parsePrismaRecursiveField(query.select, 'select')
    }
    if (query.include) {
      parsed.include = parsePrismaRecursiveField(query.include, 'include')
    }

    return parsed
  }

  async getAll(query?: IPrismaParsedQueryParams): Promise<T> {
    const results = await this.prismaDelegate.findMany({
      select: query.select,
      include: query.include,
    })

    return results
  }

  async getOne(
    resourceId: string | number,
    query?: IPrismaParsedQueryParams
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
      include: query.include,
    })

    return resource
  }

  async create(data: any, query?: IPrismaParsedQueryParams): Promise<T> {
    const createdResource = await this.prismaDelegate.create({
      data,
      select: query.select,
      include: query.include,
    })

    return createdResource
  }

  async update(
    resourceId: string | number,
    data: any,
    query?: IPrismaParsedQueryParams
  ): Promise<T> {
    const updatedResource = await this.prismaDelegate.update({
      where: {
        [this.primaryKey]: resourceId,
      },
      data,
      select: query.select,
      include: query.include,
    })

    return updatedResource
  }

  async delete(
    resourceId: string | number,
    query?: IPrismaParsedQueryParams
  ): Promise<T> {
    const deletedResource = await this.prismaDelegate.delete({
      where: {
        [this.primaryKey]: resourceId,
      },
      select: query.select,
      include: query.include,
    })

    return deletedResource
  }
}
