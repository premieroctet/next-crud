import { RouteType } from '../src/types'
import { getRouteType, GetRouteType } from '../src/utils'

describe('getRouteType without query params', () => {
  it('should return READ_ALL type', () => {
    expect(
      getRouteType({
        method: 'GET',
        url: '/api/users',
        resourceName: 'users',
      })
    ).toEqual<GetRouteType>({
      routeType: RouteType.READ_ALL,
    })
  })

  it('should return READ_ONE type', () => {
    expect(
      getRouteType({
        method: 'GET',
        url: '/api/users/1',
        resourceName: 'users',
      })
    ).toEqual<GetRouteType>({
      routeType: RouteType.READ_ONE,
      resourceId: '1',
    })
  })

  it('should return CREATE type', () => {
    expect(
      getRouteType({
        method: 'POST',
        url: '/api/users',
        resourceName: 'users',
      })
    ).toEqual<GetRouteType>({
      routeType: RouteType.CREATE,
    })
  })

  it('should return UPDATE type', () => {
    expect(
      getRouteType({
        method: 'PUT',
        url: '/api/users/1',
        resourceName: 'users',
      })
    ).toEqual<GetRouteType>({
      routeType: RouteType.UPDATE,
      resourceId: '1',
    })

    expect(
      getRouteType({
        method: 'PATCH',
        url: '/api/users/1',
        resourceName: 'users',
      })
    ).toEqual<GetRouteType>({
      routeType: RouteType.UPDATE,
      resourceId: '1',
    })
  })

  it('should return DELETE type', () => {
    expect(
      getRouteType({
        method: 'DELETE',
        url: '/api/users/1',
        resourceName: 'users',
      })
    ).toEqual<GetRouteType>({
      routeType: RouteType.DELETE,
      resourceId: '1',
    })
  })
})

describe('getRouteType with query params', () => {
  it('should return READ_ALL type', () => {
    expect(
      getRouteType({
        method: 'GET',
        url: '/api/users?q=1',
        resourceName: 'users',
      })
    ).toEqual<GetRouteType>({
      routeType: RouteType.READ_ALL,
    })
  })

  it('should return READ_ONE type', () => {
    expect(
      getRouteType({
        method: 'GET',
        url: '/api/users/1?q=1',
        resourceName: 'users',
      })
    ).toEqual<GetRouteType>({
      routeType: RouteType.READ_ONE,
      resourceId: '1',
    })
  })

  it('should return CREATE type', () => {
    expect(
      getRouteType({
        method: 'POST',
        url: '/api/users?q=1',
        resourceName: 'users',
      })
    ).toEqual<GetRouteType>({
      routeType: RouteType.CREATE,
    })
  })

  it('should return UPDATE type', () => {
    expect(
      getRouteType({
        method: 'PUT',
        url: '/api/users/1?q=1',
        resourceName: 'users',
      })
    ).toEqual<GetRouteType>({
      routeType: RouteType.UPDATE,
      resourceId: '1',
    })

    expect(
      getRouteType({
        method: 'PATCH',
        url: '/api/users/1?q=1',
        resourceName: 'users',
      })
    ).toEqual<GetRouteType>({
      routeType: RouteType.UPDATE,
      resourceId: '1',
    })
  })

  it('should return DELETE type', () => {
    expect(
      getRouteType({
        method: 'DELETE',
        url: '/api/users/1?q=1',
        resourceName: 'users',
      })
    ).toEqual<GetRouteType>({
      routeType: RouteType.DELETE,
      resourceId: '1',
    })
  })
})
