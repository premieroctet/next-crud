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
}

export default deleteHandler
