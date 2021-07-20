import HttpError from '../httpError'
import { IUniqueResourceHandlerParams } from '../types'
import { executeMiddlewares } from '../utils'

interface IUpdateHandler<T, Q> extends IUniqueResourceHandlerParams<T, Q> {
  body: Partial<T>
}

async function updateHandler<T, Q>({
  adapter,
  response,
  body,
  resourceId,
  resourceName,
  query,
  middlewares,
  request,
}: IUpdateHandler<T, Q>): Promise<void> {
  const resource = await adapter.getOne(resourceId, query)

  if (resource) {
    const updatedResource = await adapter.update(resourceId, body, query)
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
        result: updatedResource,
      }
    )
  } else {
    throw new HttpError(404, `${resourceName} ${resourceId} not found`)
  }
}

export default updateHandler
