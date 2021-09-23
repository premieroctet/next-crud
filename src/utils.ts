import { match } from 'path-to-regexp'
import { RouteType, TMiddleware, TMiddlewareContext } from './types'

interface GetRouteTypeParams {
  method: string
  url: string
  resourceName: string
}

export interface GetRouteType {
  routeType: RouteType | null
  resourceId?: string
}

type TPathMatch = { id: string }

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

  const entityMatcher = match<TPathMatch>(
    [`/(.*)/${resourceName}`, `/(.*)/${resourceName}/:id`],
    { decode: decodeURIComponent }
  )
  const simpleMatcher = match(`/(.*)/${resourceName}`, {
    decode: decodeURIComponent,
  })

  switch (method) {
    case 'GET': {
      const pathMatch = entityMatcher(realPath)

      // If we got a /something after the resource name, we are reading 1 entity
      if (pathMatch && pathMatch.params.id) {
        return {
          routeType: RouteType.READ_ONE,
          resourceId: pathMatch.params.id,
        }
      }

      return {
        routeType: RouteType.READ_ALL,
      }
    }
    case 'POST': {
      const pathMatch = simpleMatcher(realPath)

      if (pathMatch) {
        return {
          routeType: RouteType.CREATE,
        }
      }

      return {
        routeType: null,
      }
    }
    case 'PUT':
    case 'PATCH': {
      const pathMatch = entityMatcher(realPath)

      if (pathMatch && pathMatch.params.id) {
        return {
          routeType: RouteType.UPDATE,
          resourceId: pathMatch.params.id,
        }
      }

      return {
        routeType: null,
      }
    }
    case 'DELETE': {
      const pathMatch = entityMatcher(realPath)

      if (pathMatch && pathMatch.params.id) {
        return {
          routeType: RouteType.DELETE,
          resourceId: pathMatch.params.id,
        }
      }

      return {
        routeType: null,
      }
    }
    default: {
      return {
        routeType: null,
      }
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
    /* istanbul ignore next */
    if (index === prevIndex) {
      throw new Error('too many next() invocations')
    }

    prevIndex = index
    const fn = validMiddlewares[index]

    if (fn) {
      await fn(ctx, () => {
        return runner(index + 1)
      })
    }
  }

  return runner(0)
}
