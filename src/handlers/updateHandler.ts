import { IUniqueResourceHandlerParams } from '../types'

interface IUpdateHandler<T> extends IUniqueResourceHandlerParams<T> {
  body: Partial<T>
}

async function updateHandler<T>({
  adapter,
  response,
  body,
  resourceId,
  query,
}: IUpdateHandler<T>): Promise<void> {
  const updatedResource = await adapter.update(resourceId, body, query)

  response.send(updatedResource)
}

export default updateHandler
