import { RouteType, TMiddleware, TMiddlewareContext } from './types'

interface GetRouteTypeParams {
  method: string
  url: string
  resourceName: string
}

export interface GetRouteType {
  routeType: RouteType
  resourceId?: string
}

export const getRouteType = ({
  method,
  url,
  resourceName,
}: GetRouteTypeParams): GetRouteType | null => {
  // Exclude the query params from the path
  const realPath = url.split('?')[0]

  if (!realPath.includes(`/${resourceName}`)) {
    throw new Error(
      `invalid resource name '${resourceName}' for route '${realPath}'`
    )
  }

  const [resourceId] = realPath.split('/').reverse()

  switch (method) {
    case 'GET': {
      const pathMatch = realPath.match(new RegExp(`/${resourceName}(/.*)?`))
      // If we got a /something after the resource name, we are reading 1 entity
      if (pathMatch && pathMatch[1]) {
        return {
          routeType: RouteType.READ_ONE,
          resourceId,
        }
      }

      return {
        routeType: RouteType.READ_ALL,
      }
    }
    case 'POST': {
      const pathMatch = new RegExp(`/${resourceName}$`).test(realPath)

      if (pathMatch) {
        return {
          routeType: RouteType.CREATE,
        }
      }

      return null
    }
    case 'PUT':
    case 'PATCH': {
      const pathMatch = new RegExp(`/${resourceName}/.*$`).test(realPath)

      if (pathMatch) {
        return {
          routeType: RouteType.UPDATE,
          resourceId,
        }
      }

      return null
    }
    case 'DELETE': {
      const pathMatch = new RegExp(`/${resourceName}/.*$`).test(realPath)

      if (pathMatch) {
        return {
          routeType: RouteType.DELETE,
          resourceId,
        }
      }

      return null
    }
    default: {
      return null
    }
  }
}

export const formatResourceId = (resourceId: string): string | number => {
  return Number.isSafeInteger(+resourceId) ? +resourceId : resourceId
}

const primitiveTypes = ['string', 'boolean', 'number']

export const isPrimitive = (value: any): boolean => {
  return primitiveTypes.includes(typeof value)
}

export const executeMiddlewares = async <T extends any>(
  middlewares: TMiddleware<T>[],
  ctx: TMiddlewareContext<T>
) => {
  const validMiddlewares = middlewares.filter((fn) => typeof fn === 'function')
  let prevIndex = -1

  const runner = async (index: number) => {
    if (index === prevIndex) {
      throw new Error('too many next() invocations')
    }

    prevIndex = index
    const fn = validMiddlewares[index]

    if (fn) {
      fn(ctx, () => {
        return runner(index + 1)
      })
    }
  }

  await runner(0)
}
