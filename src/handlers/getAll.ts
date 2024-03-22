import { IHandlerParams, TPaginationResult } from '../types'
import { executeMiddlewares } from '../utils'

interface IGetAllHandler<T, Q> extends IHandlerParams<T, Q> {
  paginated: boolean
}

async function getAllHandler<T, Q>({
  adapter,
  query,
  middlewares,
  request,
  paginated,
  resourceName,
}: IGetAllHandler<T, Q>): Promise<T[] | TPaginationResult<T>> {
  const resources = await adapter.getAll(resourceName, query)
  let dataResponse: T[] | TPaginationResult<T> = resources
  if (paginated) {
    const paginationData = await adapter.getPaginationData(resourceName, query)
    dataResponse = {
      data: resources,
      pagination: paginationData,
    }
  }

  // @ts-expect-error
  await executeMiddlewares<T[] | TPaginationResult<T>>(middlewares, {
    req: request,
    result: dataResponse,
  })

  return dataResponse
}

export default getAllHandler
