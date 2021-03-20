import HttpError from '../httpError'
import { IUniqueResourceHandlerParams } from '../types'
import { executeMiddlewares } from '../utils'

interface IGetOneHandler<T, Q> extends IUniqueResourceHandlerParams<T, Q> {}

async function getOneHandler<T, Q>({
  adapter,
  response,
  resourceId,
  resourceName,
  query,
  middlewares,
  request,
}: IGetOneHandler<T, Q>): Promise<void> {
  const resource = await adapter.getOne(resourceId, query)

  if (!resource) {
    throw new HttpError(404, `${resourceName} ${resourceId} not found`)
  }

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
      result: resource,
    }
  )
}

export default getOneHandler
