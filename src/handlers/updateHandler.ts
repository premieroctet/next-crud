import HttpError from '../httpError'
import { IUniqueResourceHandlerParams } from '../types'
import { executeMiddlewares } from '../utils'

interface IUpdateHandler<T, Q> extends IUniqueResourceHandlerParams<T, Q> {
  body: Partial<T>
}

async function updateHandler<T, Q>({
  adapter,
  body,
  resourceId,
  resourceName,
  query,
  middlewares,
  request,
}: IUpdateHandler<T, Q>): Promise<Awaited<T>> {
  const resource = await adapter.getOne(resourceName, resourceId, query)

  if (resource) {
    const updatedResource = await adapter.update(
      resourceName,
      resourceId,
      body,
      query
    )
    await executeMiddlewares(middlewares, {
      req: request,
      result: updatedResource,
    })

    return updatedResource
  } else {
    throw new HttpError(404, `${resourceName} ${resourceId} not found`)
  }
}

export default updateHandler
