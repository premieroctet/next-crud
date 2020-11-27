import { IHandlerParams } from '../types'

interface IGetAllHandler<T> extends IHandlerParams<T> {}

async function getAllHandler<T>({
  adapter,
  response,
  query,
}: IGetAllHandler<T>): Promise<void> {
  const resources = await adapter.getAll(query)

  response.status(200).send(resources)
}

export default getAllHandler
