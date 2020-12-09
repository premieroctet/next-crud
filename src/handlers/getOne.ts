import { IUniqueResourceHandlerParams } from '../types'

interface IGetOneHandler<T, Q> extends IUniqueResourceHandlerParams<T, Q> {}

async function getOneHandler<T, Q>({
  adapter,
  response,
  resourceId,
  query,
}: IGetOneHandler<T, Q>): Promise<void> {
  const resource = await adapter.getOne(resourceId, query)

  response.send(resource)
}

export default getOneHandler
