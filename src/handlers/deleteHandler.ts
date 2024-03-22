import HttpError from '../httpError'
import { IUniqueResourceHandlerParams } from '../types'
import { executeMiddlewares } from '../utils'

interface IDeleteHandler<T, Q> extends IUniqueResourceHandlerParams<T, Q> {}

async function deleteHandler<T, Q>({
  adapter,
  resourceId,
  resourceName,
  query,
  request,
  middlewares,
}: IDeleteHandler<T, Q>): Promise<Awaited<T>> {
  const resource = await adapter.getOne(resourceName, resourceId, query)

  if (resource) {
    const deletedResource = await adapter.delete(
      resourceName,
      resourceId,
      query
    )
    await executeMiddlewares(middlewares, {
      req: request,
      result: deletedResource,
    })

    return deletedResource
  } else {
    throw new HttpError(404, `${resourceName} ${resourceId} not found`)
  }
}

export default deleteHandler
