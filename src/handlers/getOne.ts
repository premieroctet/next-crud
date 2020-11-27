import { IUniqueResourceHandlerParams } from '../types'

interface IGetOneHandler<T> extends IUniqueResourceHandlerParams<T> {}

async function getOneHandler<T>({
  adapter,
  response,
  resourceId,
  query,
}: IGetOneHandler<T>): Promise<void> {
  const resource = await adapter.getOne(resourceId, query)

  response.send(resource)
}

export default getOneHandler
