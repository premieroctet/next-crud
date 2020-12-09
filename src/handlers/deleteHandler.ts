import { IUniqueResourceHandlerParams } from '../types'

interface IDeleteHandler<T, Q> extends IUniqueResourceHandlerParams<T, Q> {}

async function deleteHandler<T, Q>({
  adapter,
  response,
  resourceId,
  query,
}: IDeleteHandler<T, Q>): Promise<void> {
  const deletedResource = await adapter.delete(resourceId, query)

  response.send(deletedResource)
}

export default deleteHandler
