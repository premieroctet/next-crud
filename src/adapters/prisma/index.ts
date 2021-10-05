import {
  // @ts-ignore
  PrismaClient,
  // @ts-ignore
  PrismaAction,
  // @ts-ignore
  PrismaClientKnownRequestError,
  // @ts-ignore
  PrismaClientValidationError,
} from '@prisma/client'
import HttpError from '../../httpError'
import { IAdapter, IParsedQueryParams, TPaginationData } from '../../types'
import { IPrismaParsedQueryParams } from './types'
import { parsePrismaCursor } from './utils/parseCursor'
import { parsePrismaOrderBy } from './utils/parseOrderBy'
import { parsePrismaRecursiveField } from './utils/parseRecursive'
import { parsePrismaWhere } from './utils/parseWhere'
import PrismaJsonSchemaParser from './jsonSchemaParser'

interface IAdapterCtorArgs<M extends string = string> {
  primaryKey?: string
  manyRelations?: {
    [key in M]?: string[]
  }
  prismaClient: PrismaClient
  models?: M[]
}

export default class PrismaAdapter<T, M extends string>
  implements IAdapter<T, IPrismaParsedQueryParams, M>
{
  private primaryKey: string
  private manyRelations: {
    [key in M]?: string[]
  }
  private prismaClient: PrismaClient
  models: M[]
  private prismaJsonSchemaParser: PrismaJsonSchemaParser

  constructor({
    primaryKey = 'id',
    prismaClient,
    manyRelations = {},
    models,
  }: IAdapterCtorArgs<M>) {
    this.prismaClient = prismaClient
    this.primaryKey = primaryKey
    this.manyRelations = manyRelations
    // @ts-ignore
    const prismaDmmfModels = prismaClient._dmmf?.mappingsMap
    if (typeof models !== 'undefined') {
      models.forEach((model) => {
        if (!Object.keys(prismaDmmfModels).includes(model)) {
          throw new Error(`Model name ${model} is invalid.`)
        }
      })
    }

    this.models =
      // @ts-ignore
      models ||
      // @ts-ignore
      (Object.keys(prismaDmmfModels) as M[]) // Retrieve model names from dmmf for prisma v2
    this.prismaJsonSchemaParser = new PrismaJsonSchemaParser(this.prismaClient)
  }
  async getPaginationData(
    resourceName: M,
    query: IPrismaParsedQueryParams
  ): Promise<TPaginationData> {
    // @ts-ignore
    const total: number = await this.getPrismaDelegate(resourceName).count({
      where: query.where,
      distinct: query.distinct,
    })

    return {
      total,
      pageCount: Math.ceil(total / query.take),
      page: Math.ceil(query.skip / query.take) + 1,
    }
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

  parseQuery(resourceName: M, query?: IParsedQueryParams) {
    const parsed: IPrismaParsedQueryParams = {}

    if (query.select) {
      parsed.select = parsePrismaRecursiveField(query.select, 'select')
    }
    if (query.include) {
      parsed.include = parsePrismaRecursiveField(query.include, 'include')
    }
    if (query.originalQuery?.where) {
      parsed.where = parsePrismaWhere(
        JSON.parse(query.originalQuery.where),
        this.manyRelations[resourceName]
      )
    }
    if (query.orderBy) {
      parsed.orderBy = parsePrismaOrderBy(query.orderBy)
    }
    if (typeof query.limit !== 'undefined') {
      parsed.take = query.limit
    }
    if (typeof query.skip !== 'undefined') {
      parsed.skip = query.skip
    }
    if (query.originalQuery?.cursor) {
      parsed.cursor = parsePrismaCursor(JSON.parse(query.originalQuery.cursor))
    }
    if (query.distinct) {
      parsed.distinct = query.distinct
    }

    return parsed
  }

  async getAll(
    resourceName: M,
    query?: IPrismaParsedQueryParams
  ): Promise<T[]> {
    // @ts-ignore
    const results: T[] = await this.getPrismaDelegate(resourceName).findMany({
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
    resourceName: M,
    resourceId: string | number,
    query?: IPrismaParsedQueryParams
  ): Promise<T> {
    const delegate = this.getPrismaDelegate(resourceName)
    /**
     * On prisma v2.12, findOne has been deprecated in favor of findUnique
     * We use findUnique in priority only if it's available
     */
    const findFn = delegate.findUnique || delegate.findOne

    const resource = await findFn({
      where: {
        [this.primaryKey]: resourceId,
      },
      select: query.select,
      include: query.include,
    })

    return resource
  }

  async create(
    resourceName: M,
    data: any,
    query?: IPrismaParsedQueryParams
  ): Promise<T> {
    const createdResource = await this.getPrismaDelegate(resourceName).create({
      data,
      select: query.select,
      include: query.include,
    })

    return createdResource
  }

  async update(
    resourceName: M,
    resourceId: string | number,
    data: any,
    query?: IPrismaParsedQueryParams
  ): Promise<T> {
    const updatedResource = await this.getPrismaDelegate(resourceName).update({
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
    resourceName: M,
    resourceId: string | number,
    query?: IPrismaParsedQueryParams
  ): Promise<T> {
    const deletedResource = await this.getPrismaDelegate(resourceName).delete({
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

  getModels() {
    return this.models
  }

  getModelsJsonSchema() {
    // @ts-ignore
    const definitions = this.prismaJsonSchemaParser.parseModels()
    const models = Object.keys(definitions)
    const inputs = this.prismaJsonSchemaParser.parseInputTypes(models)
    const schema = JSON.stringify({
      ...definitions,
      ...inputs,
      ...this.prismaJsonSchemaParser.getPaginationDataSchema(),
      ...this.prismaJsonSchemaParser.getPaginatedModelsSchemas(models),
    })
    const defs = schema.replace(/#\/definitions/g, '#/components/schemas')

    return JSON.parse(defs)
  }

  private getPrismaDelegate(
    resourceName: M
  ): Record<PrismaAction, (...args: any[]) => Promise<T>> {
    // @ts-ignore
    return this.prismaClient[
      `${resourceName.charAt(0).toLowerCase()}${resourceName.slice(1)}`
    ]
  }

  mapModelsToRouteNames() {
    const models = this.getModels()
    const routesMap: { [key in M]?: string } = {}

    for (const model of models) {
      // @ts-ignore
      routesMap[model] = this.prismaClient._dmmf.mappingsMap[model].plural
    }

    return routesMap
  }
}
