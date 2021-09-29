import { RouteType } from '../types'

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

export const formatSchemaRef = (schemaName: string) => {
  return `#/components/schemas/${schemaName}`
}
