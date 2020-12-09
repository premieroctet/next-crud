import { IHandlerParams } from '../types'

interface ICreateHandler<T, Q> extends IHandlerParams<T, Q> {
  body: Record<string, any>
}

async function createHandler<T, Q>({
  adapter,
  response,
  body,
  query,
}: ICreateHandler<T, Q>): Promise<void> {
  const createdResource = await adapter.create(body, query)

  response.status(201).send(createdResource)
}

export default createHandler
