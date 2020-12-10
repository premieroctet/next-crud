import { IHandlerParams } from '../types'
import { executeMiddlewares } from '../utils'

interface IGetAllHandler<T, Q> extends IHandlerParams<T, Q> {}

async function getAllHandler<T, Q>({
  adapter,
  response,
  query,
  middlewares,
  request,
}: IGetAllHandler<T, Q>): Promise<void> {
  const resources = await adapter.getAll(query)
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
      result: resources,
    }
  )
}

export default getAllHandler
