import { getMockReq, getMockRes } from '@jest-mock/express'
import * as http from 'http'
import NextCrud from '../src/handler'
import { IAdapter, IParsedQueryParams, RouteType } from '../src/types'
import HttpError from '../src/httpError'

class NoopAdapter implements IAdapter<unknown, unknown> {
  parseQuery(query?: IParsedQueryParams): unknown {
    return {}
  }
  async getAll(query?: unknown): Promise<unknown> {
    return {}
  }
  async getOne(resourceId: string | number, query?: unknown): Promise<unknown> {
    return {}
  }
  async create(data: any, query?: unknown): Promise<unknown> {
    return {}
  }
  async update(
    resourceId: string | number,
    data: any,
    query?: unknown
  ): Promise<unknown> {
    return {}
  }
  async delete(resourceId: string | number, query?: unknown): Promise<unknown> {
    return {}
  }

  async handleError() {
    return {}
  }
}

class InvalidAdapter {}

const generateNoopAdapter = (methods: {
  [name in keyof IAdapter<unknown, unknown>]?: (...args: any[]) => any
}) => {
  class NoopAdapterExtension
    extends NoopAdapter
    implements IAdapter<unknown, unknown> {}

  const instance = new NoopAdapterExtension()

  Object.keys(methods).forEach((key) => {
    instance[key] = methods[key]
  })

  return instance
}

describe('Handler', () => {
  it('should run the handler correctly', async () => {
    const handler = NextCrud({
      adapter: new NoopAdapter(),
      resourceName: 'foo',
    })
    const { res } = getMockRes()

    await handler(
      getMockReq({
        url: '/foo',
        method: 'GET',
      }),
      res
    )
    expect(res.send).toHaveBeenCalled()
  })

  it('should throw an error with an invalid adapter', async () => {
    expect(() =>
      NextCrud({
        // @ts-expect-error
        adapter: new InvalidAdapter(),
        resourceName: 'foo',
      })
    ).toThrowError('missing method in adapter')
  })

  it('should run onRequest', async () => {
    const onRequest = jest.fn()

    const handler = NextCrud({
      adapter: new NoopAdapter(),
      resourceName: 'foo',
      onRequest,
    })
    const { res } = getMockRes()
    const req = getMockReq({
      url: '/foo/bar',
      method: 'GET',
    })

    await handler(req, res)
    expect(onRequest).toHaveBeenCalledWith(req, res, {
      routeType: RouteType.READ_ALL,
    })
  })

  it('should run onSuccess', async () => {
    const onSuccess = jest.fn()

    const handler = NextCrud({
      adapter: new NoopAdapter(),
      resourceName: 'foo',
      onSuccess,
    })
    const { res } = getMockRes()
    const req = getMockReq({
      url: '/foo/bar',
      method: 'GET',
    })

    await handler(req, res)
    expect(onSuccess).toHaveBeenCalledWith(req, res)
  })

  it('should trigger a simple Error', async () => {
    const error = new Error('error')
    const onRequest = jest.fn(() => {
      throw error
    })

    const onError = jest.fn()

    const handler = NextCrud({
      adapter: new NoopAdapter(),
      resourceName: 'foo',
      onRequest,
      onError,
    })
    const { res } = getMockRes()
    const req = getMockReq({
      url: '/api/foo/bar',
      method: 'GET',
    })

    await handler(req, res)
    expect(onError).toHaveBeenCalledWith(req, res, error)
    expect(res.status).toHaveBeenCalledWith(500)
  })

  it('should trigger an 400 HttpError', async () => {
    const error = new HttpError(400, 'Error')
    const onRequest = jest.fn(() => {
      throw error
    })

    const onError = jest.fn()

    const handler = NextCrud({
      adapter: new NoopAdapter(),
      resourceName: 'foo',
      onRequest,
      onError,
    })
    const { res } = getMockRes()
    const req = getMockReq({
      url: '/api/foo/bar',
      method: 'GET',
    })

    await handler(req, res)
    expect(onError).toHaveBeenCalledWith(req, res, error)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.send).toHaveBeenCalledWith(`${http.STATUS_CODES[400]}: Error`)
  })

  it('should run adapter handleError upon Error', async () => {
    const error = new Error()
    const getOne = jest.fn(() => {
      throw error
    })
    const handleError = jest.fn()
    const adapter = generateNoopAdapter({
      getOne,
      handleError,
    })

    const handler = NextCrud({
      adapter,
      resourceName: 'foo',
    })
    const { res } = getMockRes()
    const req = getMockReq({
      url: '/api/foo/bar',
      method: 'GET',
    })

    await handler(req, res)
    expect(adapter.handleError).toHaveBeenCalledWith(error)
  })

  it('should trigger a 404 if we fetch a route not registered in the only option', async () => {
    const handler = NextCrud({
      adapter: new NoopAdapter(),
      resourceName: 'foo',
      only: [RouteType.CREATE],
    })
    const { res } = getMockRes()
    const req = getMockReq({
      url: '/api/foo/bar',
      method: 'GET',
    })

    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('should trigger a 404 if we fetch a route that is in the exclude option', async () => {
    const handler = NextCrud({
      adapter: new NoopAdapter(),
      resourceName: 'foo',
      exclude: [RouteType.READ_ONE],
    })
    const { res } = getMockRes()
    const req = getMockReq({
      url: '/api/foo/bar',
      method: 'GET',
    })

    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('should trigger the formatResourceId option if provided', async () => {
    const formatResourceId = jest.fn()

    const handler = NextCrud({
      adapter: new NoopAdapter(),
      resourceName: 'foo',
      formatResourceId,
    })
    const { res } = getMockRes()
    const req = getMockReq({
      url: '/api/foo/bar',
      method: 'GET',
    })

    await handler(req, res)
    expect(formatResourceId).toHaveBeenCalledWith('bar')
  })

  it('should trigger the customHandler option if provided', async () => {
    const customHandler = jest.fn()
    const adapter = new NoopAdapter()

    const handler = NextCrud({
      adapter,
      resourceName: 'foo',
      customHandlers: [
        {
          path: '/api/foo/:id',
          handler: customHandler,
        },
      ],
    })
    const { res } = getMockRes()
    const req = getMockReq({
      url: '/api/foo/bar',
      method: 'GET',
    })

    await handler(req, res)
    expect(customHandler).toHaveBeenCalledWith({ req, res, adapter })
  })

  it('should not trigger the provided customHandler with a non matching path', async () => {
    const customHandler = jest.fn()
    const adapter = new NoopAdapter()

    const handler = NextCrud({
      adapter,
      resourceName: 'foo',
      customHandlers: [
        {
          path: '/api/foo/id/:id',
          handler: customHandler,
        },
      ],
    })
    const { res } = getMockRes()
    const req = getMockReq({
      url: '/api/foo/bar',
      method: 'GET',
    })

    await handler(req, res)
    expect(customHandler).not.toHaveBeenCalled()
  })

  it('should run the adapter parseQuery function', async () => {
    const parseQuery = jest.fn()
    const adapter = generateNoopAdapter({ parseQuery })

    const handler = NextCrud({
      adapter,
      resourceName: 'foo',
    })

    const { res } = getMockRes()
    const req = getMockReq({
      url: '/api/foo/bar?foo=bar',
      method: 'GET',
    })

    await handler(req, res)
    expect(parseQuery).toHaveBeenCalledWith({ originalQuery: { foo: 'bar' } })
  })

  it('should run the adapter connect and disconnect functions', async () => {
    const connect = jest.fn()
    const disconnect = jest.fn()
    const adapter = generateNoopAdapter({ connect, disconnect })

    const handler = NextCrud({
      adapter,
      resourceName: 'foo',
    })

    const { res } = getMockRes()
    const req = getMockReq({
      url: '/api/foo/bar?foo=bar',
      method: 'GET',
    })

    await handler(req, res)
    expect(connect).toHaveBeenCalled()
    expect(disconnect).toHaveBeenCalled()
  })

  describe('Read one', () => {
    it('should read one resource correctly', async () => {
      const data = { foo: 'bar' }
      const getOne = jest.fn(() => data)
      const adapter = generateNoopAdapter({ getOne })
      const handler = NextCrud({
        adapter,
        resourceName: 'foo',
      })

      const { res } = getMockRes()
      const req = getMockReq({
        url: '/api/foo/bar',
        method: 'GET',
      })
      await handler(req, res)
      expect(res.send).toHaveBeenCalledWith(data)
    })

    it('should throw a 404 for a non existing resource', async () => {
      const getOne = jest.fn(() => null)
      const adapter = generateNoopAdapter({ getOne })
      const handler = NextCrud({
        adapter,
        resourceName: 'foo',
      })

      const { res } = getMockRes()
      const req = getMockReq({
        url: '/api/foo/bar',
        method: 'GET',
      })
      await handler(req, res)
      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.send).toHaveBeenCalledWith(
        `${http.STATUS_CODES[404]}: foo bar not found`
      )
    })
  })

  describe('Read all', () => {
    it('should read a collection of resources', async () => {
      const collection = [{ id: 1 }, { id: 2 }]
      const getAll = jest.fn(() => collection)
      const adapter = generateNoopAdapter({ getAll })
      const handler = NextCrud({
        adapter,
        resourceName: 'foo',
      })

      const { res } = getMockRes()
      const req = getMockReq({
        url: '/api/foo',
        method: 'GET',
      })
      await handler(req, res)
      expect(res.send).toHaveBeenCalledWith(collection)
    })
  })

  describe('Create one', () => {
    it('should return a 201 status code upon a resource creation', async () => {
      const data = { foo: 'bar' }
      const create = jest.fn(() => data)
      const adapter = generateNoopAdapter({ create })
      const handler = NextCrud({
        adapter,
        resourceName: 'foo',
      })

      const { res } = getMockRes()
      const req = getMockReq({
        url: '/api/foo',
        method: 'POST',
      })
      await handler(req, res)
      expect(res.send).toHaveBeenCalledWith(data)
      expect(res.status).toHaveBeenCalledWith(201)
    })
  })

  describe('Update one', () => {
    it('should update an existing resource', async () => {
      const data = { id: 1 }
      const body = { foo: 'bar' }
      const getOne = jest.fn(() => data)
      const update = jest.fn(() => ({ ...data, ...body }))
      const adapter = generateNoopAdapter({ getOne, update })
      const handler = NextCrud({
        adapter,
        resourceName: 'foo',
      })

      const { res } = getMockRes()
      const req = getMockReq({
        url: '/api/foo/bar',
        method: 'PUT',
        body,
      })
      await handler(req, res)
      expect(res.send).toHaveBeenCalledWith({ ...data, ...body })
      expect(update).toHaveBeenCalledWith('bar', body, {})
    })

    it('should throw a 404 when updating a non existing resource', async () => {
      const getOne = jest.fn(() => null)
      const update = jest.fn(() => null)
      const adapter = generateNoopAdapter({ getOne, update })
      const handler = NextCrud({
        adapter,
        resourceName: 'foo',
      })

      const { res } = getMockRes()
      const req = getMockReq({
        url: '/api/foo/bar',
        method: 'PUT',
      })
      await handler(req, res)
      expect(res.status).toHaveBeenCalledWith(404)
      expect(update).not.toHaveBeenCalled()
    })
  })

  describe('Delete one', () => {
    it('should correctly delete a resource', async () => {
      const data = { id: 1 }
      const getOne = jest.fn(() => data)
      const deleteFn = jest.fn(() => data)
      const adapter = generateNoopAdapter({ getOne, delete: deleteFn })
      const handler = NextCrud({
        adapter,
        resourceName: 'foo',
      })

      const { res } = getMockRes()
      const req = getMockReq({
        url: '/api/foo/bar',
        method: 'DELETE',
      })
      await handler(req, res)
      expect(res.send).toHaveBeenCalledWith(data)
      expect(deleteFn).toHaveBeenCalledWith('bar', {})
    })

    it('should throw a 404 when deleting a non existing resource', async () => {
      const getOne = jest.fn(() => null)
      const deleteFn = jest.fn(() => null)
      const adapter = generateNoopAdapter({ getOne, delete: deleteFn })
      const handler = NextCrud({
        adapter,
        resourceName: 'foo',
      })

      const { res } = getMockRes()
      const req = getMockReq({
        url: '/api/foo/bar',
        method: 'DELETE',
      })
      await handler(req, res)
      expect(res.status).toHaveBeenCalledWith(404)
      expect(deleteFn).not.toHaveBeenCalledWith()
    })
  })

  describe('Unknown method', () => {
    it('should return 404 upon unknown method', async () => {
      const handler = NextCrud({
        adapter: new NoopAdapter(),
        resourceName: 'foo',
      })

      const { res } = getMockRes()
      const req = getMockReq({
        url: '/api/foo',
        method: 'OPTIONS',
      })
      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
    })

    it('should return 404 upon unknwon method even if accessibleRoutes allows it', async () => {
      const handler = NextCrud({
        adapter: new NoopAdapter(),
        resourceName: 'foo',
        only: [null],
      })

      const { res } = getMockRes()
      const req = getMockReq({
        url: '/api/foo',
        method: 'OPTIONS',
      })
      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
    })

    it('should return 404 upon unknwon method even if its the only one not excluded', async () => {
      const handler = NextCrud({
        adapter: new NoopAdapter(),
        resourceName: 'foo',
        exclude: [
          RouteType.CREATE,
          RouteType.DELETE,
          RouteType.READ_ALL,
          RouteType.READ_ONE,
          RouteType.UPDATE,
        ],
      })

      const { res } = getMockRes()
      const req = getMockReq({
        url: '/api/foo',
        method: 'OPTIONS',
      })
      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
    })
  })
})
