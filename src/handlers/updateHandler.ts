import { IUniqueResourceHandlerParams } from '../types'

interface IUpdateHandler<T, Q> extends IUniqueResourceHandlerParams<T, Q> {
  body: Partial<T>
}

async function updateHandler<T, Q>({
  adapter,
  response,
  body,
  resourceId,
  query,
}: IUpdateHandler<T, Q>): Promise<void> {
  const updatedResource = await adapter.update(resourceId, body, query)

  response.send(updatedResource)
}

export default updateHandler
