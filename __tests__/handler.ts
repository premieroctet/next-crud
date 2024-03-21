import * as http from 'http'
import NextCrud from '../src/handler'
import { IAdapter, RouteType, TPaginationData } from '../src/types'
import HttpError from '../src/httpError'
import { ApiError } from 'next/dist/server/api-utils'
import { RequestOptions, createMocks as createHttpMocks } from 'node-mocks-http'
import { NextApiRequest, NextApiResponse } from 'next'

const createMocks = (options: RequestOptions) => {
  const { req, res } = createHttpMocks(options)

  return {
    req: req as unknown as NextApiRequest,
    res: {
      ...res,
      send: jest.spyOn(res, 'send'),
      status: jest.spyOn(res, 'status'),
    } as unknown as NextApiResponse,
  }
}

class NoopAdapter implements IAdapter<unknown, unknown, string> {
  models: string[] = []

  constructor(models: string[] = []) {
    this.models = models
  }

  async getPaginationData(): Promise<TPaginationData> {
    return {
      total: 1,
      pageCount: 1,
      page: 1,
    }
  }
  parseQuery(): unknown {
    return {}
  }
  async getAll(): Promise<unknown[]> {
    return []
  }
  async getOne(): Promise<unknown> {
    return {}
  }
  async create(): Promise<unknown> {
    return {}
  }
  async update(): Promise<unknown> {
    return {}
  }
  async delete(): Promise<unknown> {
    return {}
  }

  async handleError() {
    return {}
  }

  getModels() {
    return this.models
  }
}

class InvalidAdapter {}

const generateNoopAdapter = (
  methods: {
    [name in keyof IAdapter<unknown, unknown>]?: (...args: unknown[]) => unknown
  },
  models: string[] = []
) => {
  class NoopAdapterExtension
    extends NoopAdapter
    implements IAdapter<unknown, unknown> {}

  const instance = new NoopAdapterExtension(models)

  Object.keys(methods).forEach((key) => {
    instance[key] = methods[key]
  })

  return instance
}

describe('Handler', () => {
  it('should run the handler correctly', async () => {
    const handler = await NextCrud({
      adapter: new NoopAdapter(['foo']),
    })
    const { req, res } = createMocks({
      url: '/foo',
      method: 'GET',
    })

    await handler(req, res)
    expect(res.send).toHaveBeenCalled()
  })

  it('should throw an error with an invalid adapter', async () => {
    expect(() =>
      NextCrud({
        // @ts-ignore
        adapter: new InvalidAdapter(),
      })
    ).rejects.toBeInstanceOf(Error)
  })

  it('should return a 404 error when no path matches', async () => {
    const handler = await NextCrud({
      adapter: new NoopAdapter(),
    })
    const { req, res } = createMocks({
      url: '/bar',
      method: 'GET',
    })

    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('should run onRequest', async () => {
    const onRequest = jest.fn()

    const handler = await NextCrud({
      adapter: new NoopAdapter(['foo']),
      onRequest,
    })
    const { req, res } = createMocks({
      url: '/foo/bar',
      method: 'GET',
    })

    await handler(req, res)
    expect(onRequest).toHaveBeenCalledWith(req, res, {
      routeType: RouteType.READ_ALL,
      resourceName: 'foo',
    })
  })

  it('should run onSuccess', async () => {
    const onSuccess = jest.fn()

    const handler = await NextCrud({
      adapter: new NoopAdapter(['foo']),
      onSuccess,
    })
    const { req, res } = createMocks({
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

    const handler = await NextCrud({
      adapter: new NoopAdapter(['foo']),
      onRequest,
      onError,
    })
    const { req, res } = createMocks({
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

    const handler = await NextCrud({
      adapter: new NoopAdapter(['foo']),
      onRequest,
      onError,
    })
    const { req, res } = createMocks({
      url: '/api/foo/bar',
      method: 'GET',
    })

    await handler(req, res)
    expect(onError).toHaveBeenCalledWith(req, res, error)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.send).toHaveBeenCalledWith(`${http.STATUS_CODES[400]}: Error`)
  })

  it('should trigger an 400 HttpError using the default NextJS ApiError', async () => {
    const error = new ApiError(400, 'Error')
    const onRequest = jest.fn(() => {
      throw error
    })

    const onError = jest.fn()

    const handler = await NextCrud({
      adapter: new NoopAdapter(['foo']),
      onRequest,
      onError,
    })
    const { req, res } = createMocks({
      url: '/api/foo/bar',
      method: 'GET',
    })

    await handler(req, res)
    expect(onError).toHaveBeenCalledWith(req, res, error)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.send).toHaveBeenCalledWith(`Error`)
  })

  it('should run adapter handleError upon Error', async () => {
    const error = new Error()
    const getOne = jest.fn(() => {
      throw error
    })
    const handleError = jest.fn()
    const adapter = generateNoopAdapter(
      {
        getOne,
        handleError,
      },
      ['foo']
    )

    const handler = await NextCrud({
      adapter,
    })
    const { req, res } = createMocks({
      url: '/api/foo/bar',
      method: 'GET',
    })

    await handler(req, res)
    expect(adapter.handleError).toHaveBeenCalledWith(error)
  })

  it('should trigger a 404 if we fetch a route not registered in the only option', async () => {
    const handler = await NextCrud({
      adapter: new NoopAdapter(['foo']),
      models: {
        foo: {
          only: [RouteType.READ_ALL],
        },
      },
    })
    const { req, res } = createMocks({
      url: '/api/foo/bar',
      method: 'GET',
    })

    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('should trigger a 404 if we fetch a route that is in the exclude option', async () => {
    const handler = await NextCrud({
      adapter: new NoopAdapter(['foo']),
      models: {
        foo: {
          exclude: [RouteType.READ_ONE],
        },
      },
    })
    const { req, res } = createMocks({
      url: '/api/foo/bar',
      method: 'GET',
    })

    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('should trigger the formatResourceId option if provided', async () => {
    const formatResourceId = jest.fn()

    const handler = await NextCrud({
      adapter: new NoopAdapter(['foo']),
      formatResourceId,
    })
    const { req, res } = createMocks({
      url: '/api/foo/bar',
      method: 'GET',
    })

    await handler(req, res)
    expect(formatResourceId).toHaveBeenCalledWith('bar')
  })

  it('should trigger the formatResourceId option from path config if provided', async () => {
    const formatResourceId = jest.fn()

    const handler = await NextCrud({
      adapter: new NoopAdapter(['foo']),
      models: {
        foo: {
          formatResourceId,
        },
      },
    })
    const { req, res } = createMocks({
      url: '/api/foo/bar',
      method: 'GET',
    })

    await handler(req, res)
    expect(formatResourceId).toHaveBeenCalledWith('bar')
  })

  it('should run the adapter parseQuery function', async () => {
    const parseQuery = jest.fn()
    const adapter = generateNoopAdapter({ parseQuery }, ['foo'])

    const handler = await NextCrud({
      adapter,
    })

    const { req, res } = createMocks({
      url: '/api/foo/bar?foo=bar',
      method: 'GET',
    })

    await handler(req, res)
    expect(parseQuery).toHaveBeenCalledWith('foo', {
      originalQuery: { foo: 'bar' },
    })
  })

  it('should run the adapter connect and disconnect functions', async () => {
    const connect = jest.fn()
    const disconnect = jest.fn()
    const adapter = generateNoopAdapter({ connect, disconnect }, ['foo'])

    const handler = await NextCrud({
      adapter,
    })

    const { req, res } = createMocks({
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
      const adapter = generateNoopAdapter({ getOne }, ['foo'])
      const handler = await NextCrud({
        adapter,
      })

      const { req, res } = createMocks({
        url: '/api/foo/bar',
        method: 'GET',
      })
      await handler(req, res)
      expect(res.send).toHaveBeenCalledWith(data)
    })

    it('should throw a 404 for a non existing resource', async () => {
      const getOne = jest.fn(() => null)
      const adapter = generateNoopAdapter({ getOne }, ['foo'])
      const handler = await NextCrud({
        adapter,
      })

      const { req, res } = createMocks({
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
      const adapter = generateNoopAdapter({ getAll }, ['foo'])
      const handler = await NextCrud({
        adapter,
      })

      const { req, res } = createMocks({
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
      const adapter = generateNoopAdapter({ create }, ['foo'])
      const handler = await NextCrud({
        adapter,
      })

      const { req, res } = createMocks({
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
      const adapter = generateNoopAdapter({ getOne, update }, ['foo'])
      const handler = await NextCrud({
        adapter,
      })

      const { req, res } = createMocks({
        url: '/api/foo/bar',
        method: 'PUT',
        body,
      })
      await handler(req, res)
      expect(res.send).toHaveBeenCalledWith({ ...data, ...body })
      expect(update).toHaveBeenCalledWith('foo', 'bar', body, {})
    })

    it('should throw a 404 when updating a non existing resource', async () => {
      const getOne = jest.fn(() => null)
      const update = jest.fn(() => null)
      const adapter = generateNoopAdapter({ getOne, update }, ['foo'])
      const handler = await NextCrud({
        adapter,
      })

      const { req, res } = createMocks({
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
      const adapter = generateNoopAdapter({ getOne, delete: deleteFn }, ['foo'])
      const handler = await NextCrud({
        adapter,
      })

      const { req, res } = createMocks({
        url: '/api/foo/bar',
        method: 'DELETE',
      })
      await handler(req, res)
      expect(res.send).toHaveBeenCalledWith(data)
      expect(deleteFn).toHaveBeenCalledWith('foo', 'bar', {})
    })

    it('should throw a 404 when deleting a non existing resource', async () => {
      const getOne = jest.fn(() => null)
      const deleteFn = jest.fn(() => null)
      const adapter = generateNoopAdapter({ getOne, delete: deleteFn }, ['foo'])
      const handler = await NextCrud({
        adapter,
      })

      const { req, res } = createMocks({
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
      const handler = await NextCrud({
        adapter: new NoopAdapter(['foo']),
      })

      const { req, res } = createMocks({
        url: '/api/foo',
        method: 'OPTIONS',
      })
      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
    })

    it('should return 404 upon unknwon method even if accessibleRoutes allows it', async () => {
      const handler = await NextCrud({
        adapter: new NoopAdapter(),
        models: {
          foo: {
            // @ts-ignore
            only: [null],
          },
        },
      })

      const { req, res } = createMocks({
        url: '/api/foo',
        method: 'OPTIONS',
      })
      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
    })

    it('should return 404 upon unknwon method even if its the only one not excluded', async () => {
      const handler = await NextCrud({
        adapter: new NoopAdapter(),
        models: {
          foo: {
            exclude: [
              RouteType.CREATE,
              RouteType.DELETE,
              RouteType.READ_ALL,
              RouteType.READ_ONE,
              RouteType.UPDATE,
            ],
          },
        },
      })

      const { req, res } = createMocks({
        url: '/api/foo',
        method: 'OPTIONS',
      })
      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
    })
  })

  describe('Pagination', () => {
    it('should get page based pagination data', async () => {
      const mockResources = [{ id: 1 }]
      const getAll = jest.fn(() => {
        return mockResources
      })
      const getPaginationData = jest.fn(() => {
        return {
          total: mockResources.length,
          pageCount: 1,
        }
      })
      const adapter = generateNoopAdapter({ getAll, getPaginationData }, [
        'foo',
      ])

      const handler = await NextCrud({
        adapter,
      })

      const { req, res } = createMocks({
        url: '/api/foo?page=1',
        method: 'GET',
      })

      await handler(req, res)
      expect(res.send).toHaveBeenCalledWith({
        data: mockResources,
        pagination: {
          total: 1,
          pageCount: 1,
        },
      })
    })
  })
})
