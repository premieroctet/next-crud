import { IHandlerParams, TPaginationResult } from '../types'
import { executeMiddlewares } from '../utils'

interface IGetAllHandler<T, Q> extends IHandlerParams<T, Q> {
  paginated: boolean
}

async function getAllHandler<T, Q>({
  adapter,
  response,
  query,
  middlewares,
  request,
  paginated,
  resourceName,
}: IGetAllHandler<T, Q>): Promise<void> {
  const resources = await adapter.getAll(resourceName, query)
  let dataResponse: T[] | TPaginationResult<T> = resources
  if (paginated) {
    const paginationData = await adapter.getPaginationData(resourceName, query)
    dataResponse = {
      data: resources,
      pagination: paginationData,
    }
  }
  await executeMiddlewares<T[] | TPaginationResult<T>>(
    // @ts-ignore
    [
      // @ts-ignore
      ...middlewares,
      // @ts-ignore
      ({ result }) => {
        response.send(result)
      },
    ],
    {
      req: request,
      res: response,
      result: dataResponse,
    }
  )
}

export default getAllHandler
