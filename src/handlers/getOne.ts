import HttpError from '../httpError'
import { IUniqueResourceHandlerParams } from '../types'
import { executeMiddlewares } from '../utils'

interface IGetOneHandler<T, Q> extends IUniqueResourceHandlerParams<T, Q> {}

async function getOneHandler<T, Q>({
  adapter,
  resourceId,
  resourceName,
  query,
  middlewares,
  request,
}: IGetOneHandler<T, Q>): Promise<Awaited<T>> {
  const resource = await adapter.getOne(resourceName, resourceId, query)

  if (!resource) {
    throw new HttpError(404, `${resourceName} ${resourceId} not found`)
  }

  await executeMiddlewares(middlewares, {
    req: request,
    result: resource,
  })

  return resource
}

export default getOneHandler
