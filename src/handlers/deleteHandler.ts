import { IUniqueResourceHandlerParams } from '../types'

interface IDeleteHandler<T> extends IUniqueResourceHandlerParams<T> {}

async function deleteHandler<T>({
  adapter,
  response,
  resourceId,
  query,
}: IDeleteHandler<T>): Promise<void> {
  const deletedResource = await adapter.delete(resourceId, query)

  response.send(deletedResource)
}

export default deleteHandler
