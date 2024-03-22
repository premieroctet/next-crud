import { IHandlerParams } from '../types'
import { executeMiddlewares } from '../utils'

interface ICreateHandler<T, Q> extends IHandlerParams<T, Q> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: Record<string, any>
}

async function createHandler<T, Q>({
  adapter,
  body,
  query,
  request,
  middlewares,
  resourceName,
}: ICreateHandler<T, Q>): Promise<Awaited<T>> {
  const createdResource = await adapter.create(resourceName, body, query)
  await executeMiddlewares(middlewares, {
    req: request,
    result: createdResource,
  })

  return createdResource
}

export default createHandler
