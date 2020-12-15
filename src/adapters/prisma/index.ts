import {
  PrismaClient,
  PrismaAction,
  PrismaClientOptions,
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
  // @ts-ignore
} from '@prisma/client'
import HttpError from '../../httpError'
import { IAdapter, IParsedQueryParams } from '../../types'
import { IPrismaParsedQueryParams } from './types'
import { parsePrismaCursor } from './utils/parseCursor'
import { parsePrismaOrderBy } from './utils/parseOrderBy'
import { parsePrismaRecursiveField } from './utils/parseRecursive'
import { parsePrismaWhere } from './utils/parseWhere'

interface IAdapterCtorArgs<T> {
  modelName: keyof PrismaClient
  primaryKey?: string
  options?: PrismaClientOptions
  manyRelations?: Array<keyof T>
}

export default class PrismaAdapter<T>
  implements IAdapter<T, IPrismaParsedQueryParams> {
  private prismaDelegate: Record<PrismaAction, (...args: any[]) => Promise<T>>
  private primaryKey: string
  private manyRelations: Array<keyof T>
  private prismaClient: PrismaClient

  constructor({
    modelName,
    primaryKey = 'id',
    options,
    manyRelations = [],
  }: IAdapterCtorArgs<T>) {
    this.prismaClient = new PrismaClient(options)
    this.prismaDelegate = this.prismaClient[modelName]
    this.primaryKey = primaryKey
    this.manyRelations = manyRelations
  }

  handleError(err: Error) {
    console.error(err.message)
    if (
      err instanceof PrismaClientKnownRequestError ||
      err instanceof PrismaClientValidationError
    ) {
      throw new HttpError(
        400,
        'invalid request, check your server logs for more info'
      )
    } else {
      throw new HttpError(
        500,
        'an unknown error occured, check your server logs for more info'
      )
    }
  }

  parseQuery(query?: IParsedQueryParams) {
    const parsed: IPrismaParsedQueryParams = {}

    if (query.select) {
      parsed.select = parsePrismaRecursiveField(query.select, 'select')
    }
    if (query.include) {
      parsed.include = parsePrismaRecursiveField(query.include, 'include')
    }
    if (query.where) {
      parsed.where = parsePrismaWhere(
        query.where,
        this.manyRelations as string[]
      )
    }
    if (query.orderBy) {
      parsed.orderBy = parsePrismaOrderBy(query.orderBy)
    }
    if (query.limit) {
      parsed.take = query.limit
    }
    if (query.skip) {
      parsed.skip = query.skip
    }
    if (query.cursor) {
      parsed.cursor = parsePrismaCursor(JSON.parse(query.cursor))
    }
    if (query.distinct) {
      parsed.distinct = query.distinct
    }

    return parsed
  }

  async getAll(query?: IPrismaParsedQueryParams): Promise<T> {
    const results = await this.prismaDelegate.findMany({
      select: query.select,
      include: query.include,
      where: query.where,
      orderBy: query.orderBy,
      cursor: query.cursor,
      take: query.take,
      skip: query.skip,
      distinct: query.distinct,
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

  connect() {
    return this.prismaClient.$connect()
  }

  disconnect() {
    return this.prismaClient.$disconnect()
  }

  get client() {
    return this.prismaClient
  }
}
