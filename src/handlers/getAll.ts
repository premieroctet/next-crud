import { IHandlerParams } from '../types'

interface IGetAllHandler<T, Q> extends IHandlerParams<T, Q> {}

async function getAllHandler<T, Q>({
  adapter,
  response,
  query,
}: IGetAllHandler<T, Q>): Promise<void> {
  const resources = await adapter.getAll(query)

  response.status(200).send(resources)
}

export default getAllHandler
