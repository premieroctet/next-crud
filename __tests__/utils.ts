import { getMockReq, getMockRes } from '@jest-mock/express'
import { RouteType, TPaginationOptions } from '../src/types'
import {
  applyPaginationOptions,
  ensureCamelCase,
  executeMiddlewares,
  formatResourceId,
  getPaginationOptions,
  getResourceNameFromUrl,
  getRouteType,
  GetRouteType,
  isPrimitive,
} from '../src/utils'

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

  it('should throw with an invalid resource name', () => {
    expect(() =>
      getRouteType({ method: 'GET', url: '/api/users', resourceName: 'foo' })
    ).toThrow()
  })

  it('should return null routeType with invalid path for POST', () => {
    const { routeType } = getRouteType({
      method: 'POST',
      url: '/api/foo/1',
      resourceName: 'foo',
    })

    expect(routeType).toBeNull()
  })

  it('should return null routeType with invalid path for PUT', () => {
    const { routeType } = getRouteType({
      method: 'PUT',
      url: '/api/foo',
      resourceName: 'foo',
    })

    expect(routeType).toBeNull()
  })

  it('should return null routeType with invalid path for PATCH', () => {
    const { routeType } = getRouteType({
      method: 'PATCH',
      url: '/api/foo',
      resourceName: 'foo',
    })

    expect(routeType).toBeNull()
  })

  it('should return null routeType with invalid path for DELETE', () => {
    const { routeType } = getRouteType({
      method: 'DELETE',
      url: '/api/foo',
      resourceName: 'foo',
    })

    expect(routeType).toBeNull()
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

  it('should throw with an invalid resource name', () => {
    expect(() =>
      getRouteType({
        method: 'GET',
        url: '/api/users?q=1',
        resourceName: 'foo',
      })
    ).toThrow()
  })
})

describe('Middlewares', () => {
  it('should run a sequence of middlewares', async () => {
    const fn1 = jest.fn((ctx, next) => {
      next()
    })
    const fn2 = jest.fn()
    const { res } = getMockRes()
    const req = getMockReq({
      url: '/api/foo/bar',
      method: 'GET',
    })

    await executeMiddlewares([fn1, fn2], { req, res, result: {} })
    expect(fn1).toHaveBeenCalled()
    expect(fn2).toHaveBeenCalled()
  })

  it('should run correctly an async middleware', async () => {
    const fn1 = jest.fn(async (ctx, next) => {
      await new Promise((resolve) => setTimeout(resolve, 200))
      ctx.result = {
        customKey: ctx.result,
      }
      next()
    })
    const fn2 = jest.fn()
    const { res } = getMockRes()
    const req = getMockReq({
      url: '/api/foo/bar',
      method: 'GET',
    })

    const result = {
      data: 1,
    }

    await executeMiddlewares([fn1, fn2], { req, res, result })
    expect(fn1).toHaveBeenCalled()
    expect(fn2.mock.calls[0][0]).toEqual({
      req,
      res,
      result: { customKey: result },
    })
  })
})

describe('Primitives', () => {
  it('should return true for primitives', () => {
    const nbr = 1
    const str = 'hello'
    const bool = true

    expect(isPrimitive(nbr)).toBe(true)
    expect(isPrimitive(str)).toBe(true)
    expect(isPrimitive(bool)).toBe(true)
  })

  it('should return false for non primitive types', () => {
    const obj = {}
    const arr = []
    const symbol = Symbol(0)

    expect(isPrimitive(obj)).toBe(false)
    expect(isPrimitive(arr)).toBe(false)
    expect(isPrimitive(symbol)).toBe(false)
  })
})

describe('Format resource', () => {
  it('should format a resource id from string to number', () => {
    expect(formatResourceId('1')).toBe(1)
  })

  it('should format a resource id from string to another string', () => {
    expect(formatResourceId('some-slug')).toBe('some-slug')
  })
})

describe('Pagination options', () => {
  it('should throw an error with non strictly positive page query param', () => {
    expect(() =>
      getPaginationOptions(
        {
          page: 0,
        },
        {
          perPage: 30,
        }
      )
    ).toThrow('page query must be a strictly positive number')
  })

  it('should return a number page based pagination options object with perPage based on limit', () => {
    expect(
      getPaginationOptions(
        {
          page: 1,
          limit: 50,
        },
        {
          perPage: 30,
        }
      )
    ).toEqual<TPaginationOptions>({ page: 1, perPage: 50 })
  })

  it('should apply the page based pagination options in the query', () => {
    const query = {}

    const paginationOptions: TPaginationOptions = {
      page: 1,
      perPage: 10,
    }

    applyPaginationOptions(query, paginationOptions)

    expect(query).toEqual({
      skip: 0,
      limit: 10,
    })
  })
})

it('should get the correct matching resource name', () => {
  const url = '/api/foo'

  expect(getResourceNameFromUrl(url, { Foo: 'foo' })).toEqual({
    modelName: 'Foo',
    resourceName: 'foo',
  })
})

it('should ensure the string is in camel case', () => {
  expect(ensureCamelCase('FooBar')).toBe('fooBar')
})
