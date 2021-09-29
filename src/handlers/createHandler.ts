import { IHandlerParams } from '../types'
import { executeMiddlewares } from '../utils'

interface ICreateHandler<T, Q> extends IHandlerParams<T, Q> {
  body: Record<string, any>
}

async function createHandler<T, Q>({
  adapter,
  response,
  body,
  query,
  request,
  middlewares,
  resourceName,
}: ICreateHandler<T, Q>): Promise<void> {
  const createdResource = await adapter.create(resourceName, body, query)
  await executeMiddlewares(
    [
      ...middlewares,
      ({ result }) => {
        response.status(201).send(result)
      },
    ],
    {
      req: request,
      res: response,
      result: createdResource,
    }
  )
}

export default createHandler
