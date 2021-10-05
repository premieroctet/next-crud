import {
  RouteType,
  TModelsOptions,
  TSwaggerTag,
  TSwaggerModelsConfig,
  TSwaggerParameter,
} from '../types'
import { getAccessibleRoutes } from '../utils'
import { getQueryParams } from './parameters'

export const generatePathByRouteType = (
  resourceName: string,
  routeType: RouteType
) => {
  switch (routeType) {
    case RouteType.CREATE:
    case RouteType.READ_ALL:
      return `/${resourceName}`
    case RouteType.READ_ONE:
    case RouteType.UPDATE:
    case RouteType.DELETE:
      return `/${resourceName}/id`
  }
}

export const generateMethodForRouteType = (routeType: RouteType) => {
  switch (routeType) {
    case RouteType.CREATE:
      return 'post'
    case RouteType.READ_ALL:
    case RouteType.READ_ONE:
      return 'get'
    case RouteType.UPDATE:
      return 'put'
    case RouteType.DELETE:
      return 'delete'
  }
}

const generateContentForSchema = (schemaName: string, isArray?: boolean) => {
  if (isArray) {
    return {
      type: 'array',
      items: {
        $ref: formatSchemaRef(schemaName),
      },
    }
  }

  return {
    $ref: formatSchemaRef(schemaName),
  }
}

const generateSwaggerResponse = (
  routeType: RouteType,
  modelName: string
): { statusCode: number; content: any } => {
  switch (routeType) {
    case RouteType.CREATE:
      return {
        statusCode: 201,
        content: {
          description: `${modelName} created`,
          content: {
            'application/json': {
              schema: generateContentForSchema(modelName),
            },
          },
        },
      }
    case RouteType.DELETE:
      return {
        statusCode: 200,
        content: {
          description: `${modelName} item deleted`,
          content: {
            'application/json': {
              schema: generateContentForSchema(modelName),
            },
          },
        },
      }
    case RouteType.READ_ALL:
      return {
        statusCode: 200,
        content: {
          description: `${modelName} list retrieved`,
          content: {
            'application/json': {
              schema: {
                oneOf: [
                  generateContentForSchema(modelName, true),
                  generateContentForSchema(`${modelName}Page`, false),
                ],
              },
            },
          },
        },
      }
    case RouteType.READ_ONE:
      return {
        statusCode: 200,
        content: {
          description: `${modelName} item retrieved`,
          content: {
            'application/json': {
              schema: generateContentForSchema(modelName),
            },
          },
        },
      }
    case RouteType.UPDATE:
      return {
        statusCode: 200,
        content: {
          description: `${modelName} item updated`,
          content: {
            'application/json': {
              schema: generateContentForSchema(modelName),
            },
          },
        },
      }
  }
}

const generateRequestBody = (schemaStartName: string, modelName: string) => {
  return {
    content: {
      'application/json': {
        schema: {
          $ref: formatSchemaRef(`${schemaStartName}${modelName}`),
        },
      },
    },
  }
}

export const formatSchemaRef = (schemaName: string) => {
  return `#/components/schemas/${schemaName}`
}

type TRoutes<M extends string> = {
  [key in M]?: RouteType[]
}

export const getModelsAccessibleRoutes = <M extends string>(
  modelNames: M[],
  models?: TModelsOptions<M>
): TRoutes<M> => {
  return modelNames.reduce((acc, modelName) => {
    if (models?.[modelName]) {
      return {
        ...acc,
        [modelName]: getAccessibleRoutes(
          models[modelName].only,
          models[modelName].exclude
        ),
      }
    }

    return {
      ...acc,
      [modelName]: getAccessibleRoutes(),
    }
  }, {})
}

export const getSwaggerTags = <M extends string>(
  modelNames: M[],
  modelsConfig?: TSwaggerModelsConfig<M>
): TSwaggerTag[] => {
  return modelNames.map((modelName) => {
    if (modelsConfig?.[modelName]?.tag) {
      return modelsConfig[modelName].tag
    }

    return {
      name: modelName,
    }
  })
}

const formatSimpleRoute = (resourceName: string) => `/${resourceName}`

const formatResourceAccessorRoute = (resourceName: string) =>
  `/${resourceName}/{id}`

interface IGenerateSwaggerPathObjectParams<M extends string> {
  tag: string
  routeTypes: RouteType[]
  modelsConfig: TSwaggerModelsConfig<M>
  modelName: M
  hasId?: boolean
}

const generateSwaggerPathObject = <M extends string>({
  tag,
  routeTypes,
  modelName,
  modelsConfig,
  hasId,
}: IGenerateSwaggerPathObjectParams<M>) => {
  const methods = {}

  routeTypes.forEach((routeType) => {
    if (routeTypes.includes(routeType)) {
      const returnType =
        modelsConfig?.[modelName]?.routeTypes?.[routeType]?.response?.name ??
        modelsConfig?.[modelName]?.type?.name ??
        modelName
      const response = generateSwaggerResponse(routeType, returnType)
      const method = generateMethodForRouteType(routeType)
      methods[method] = {
        tags: [tag],
        summary: modelsConfig?.[modelName]?.routeTypes?.[routeType]?.summary,
        parameters: getQueryParams(routeType).map((queryParam) => {
          return { ...queryParam, in: 'query' }
        }),
        responses: {
          [response.statusCode]: response.content,
          ...(modelsConfig?.[modelName]?.routeTypes?.[routeType]?.responses ||
            {}),
        },
      }

      if (hasId) {
        methods[method].parameters.push({
          in: 'path',
          name: 'id',
          description: `ID of the ${modelName}`,
          schema: {
            type: 'string',
            required: true,
          },
        })
      }

      if (routeType === RouteType.UPDATE || routeType === RouteType.CREATE) {
        switch (routeType) {
          case RouteType.UPDATE:
            methods[method].requestBody = generateRequestBody(
              'Update',
              returnType
            )
            break
          case RouteType.CREATE:
            methods[method].requestBody = generateRequestBody(
              'Create',
              returnType
            )
            break
        }
      }
    }
  })

  return methods
}

interface IGetSwaggerPathsParams<M extends string> {
  routes: TRoutes<M>
  modelsConfig?: TSwaggerModelsConfig<M>
  models?: TModelsOptions<M>
  routesMap?: { [key in M]?: string }
}

export const getSwaggerPaths = <M extends string>({
  routes,
  models,
  modelsConfig,
  routesMap,
}: IGetSwaggerPathsParams<M>) => {
  return Object.keys(routes).reduce((acc, val: M) => {
    const routeTypes = routes[val]
    const resourceName = models?.[val]?.name
      ? models[val].name
      : routesMap?.[val] || val
    const tag = modelsConfig?.[val]?.tag?.name || val
    if (
      routeTypes.includes(RouteType.CREATE) ||
      routeTypes.includes(RouteType.READ_ALL)
    ) {
      const path = formatSimpleRoute(resourceName)
      const routeTypesToUse = [RouteType.READ_ALL, RouteType.CREATE].filter(
        (routeType) => routeTypes.includes(routeType)
      )
      acc[path] = generateSwaggerPathObject({
        tag,
        modelName: val,
        modelsConfig,
        routeTypes: routeTypesToUse,
      })
    }

    if (
      routeTypes.includes(RouteType.READ_ONE) ||
      routeTypes.includes(RouteType.UPDATE) ||
      routeTypes.includes(RouteType.DELETE)
    ) {
      const path = formatResourceAccessorRoute(resourceName)
      const routeTypesToUse = [
        RouteType.READ_ONE,
        RouteType.UPDATE,
        RouteType.DELETE,
      ].filter((routeType) => routeTypes.includes(routeType))
      acc[path] = generateSwaggerPathObject({
        tag,
        modelName: val,
        modelsConfig,
        routeTypes: routeTypesToUse,
        hasId: true,
      })
    }

    return acc
  }, {})
}
