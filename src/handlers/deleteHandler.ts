import HttpError from '../httpError'
import { IUniqueResourceHandlerParams } from '../types'
import { executeMiddlewares } from '../utils'

interface IDeleteHandler<T, Q> extends IUniqueResourceHandlerParams<T, Q> {}

async function deleteHandler<T, Q>({
  adapter,
  response,
  resourceId,
  query,
  request,
  middlewares,
}: IDeleteHandler<T, Q>): Promise<void> {
  const resource = await adapter.getOne(resourceId, query)

  if (resource) {
    const deletedResource = await adapter.delete(resourceId, query)
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
    throw new HttpError(404, `resource ${resourceId} not found`)
  }
}

export default deleteHandler
