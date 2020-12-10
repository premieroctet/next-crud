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
  query,
  middlewares,
  request,
}: IUpdateHandler<T, Q>): Promise<void> {
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
}

export default updateHandler
