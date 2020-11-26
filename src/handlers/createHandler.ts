import { IHandlerParams } from '../types'

interface ICreateHandler<T> extends IHandlerParams<T> {
  body: Record<string, any>
}

async function createHandler<T>({
  prismaDelegate,
  response,
  body,
}: ICreateHandler<T>): Promise<void> {
  const createdResource = await prismaDelegate.create({
    data: body,
  })

  response.status(201).send(createdResource)
}

export default createHandler
