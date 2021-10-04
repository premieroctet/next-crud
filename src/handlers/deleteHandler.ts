import HttpError from '../httpError'
import { IUniqueResourceHandlerParams } from '../types'
import { executeMiddlewares } from '../utils'

interface IDeleteHandler<T, Q> extends IUniqueResourceHandlerParams<T, Q> {}

async function deleteHandler<T, Q>({
  adapter,
  response,
  resourceId,
  resourceName,
  query,
  request,
  middlewares,
}: IDeleteHandler<T, Q>): Promise<void> {
  const resource = await adapter.getOne(resourceName, resourceId, query)

  if (resource) {
    const deletedResource = await adapter.delete(
      resourceName,
      resourceId,
      query
    )
    await executeMiddlewares(
      [
        ...middlewares,
        ({ result }) => {
          response.send(result)
        },
      ],
      {
        req: request,
        res: response,
        result: deletedResource,
      }
    )
  } else {
    throw new HttpError(404, `${resourceName} ${resourceId} not found`)
  }
}

export default deleteHandler
