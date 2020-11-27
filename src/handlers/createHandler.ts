import { IHandlerParams } from '../types'

interface ICreateHandler<T> extends IHandlerParams<T> {
  body: Record<string, any>
}

async function createHandler<T>({
  adapter,
  response,
  body,
  query,
}: ICreateHandler<T>): Promise<void> {
  const createdResource = await adapter.create(body, query)

  response.status(201).send(createdResource)
}

export default createHandler
