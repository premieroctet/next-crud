import { IUniqueResourceHandlerParams } from '../types'
import { executeMiddlewares } from '../utils'

interface IGetOneHandler<T, Q> extends IUniqueResourceHandlerParams<T, Q> {}

async function getOneHandler<T, Q>({
  adapter,
  response,
  resourceId,
  query,
  middlewares,
  request,
}: IGetOneHandler<T, Q>): Promise<void> {
  const resource = await adapter.getOne(resourceId, query)
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