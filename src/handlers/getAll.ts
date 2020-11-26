import { IHandlerParams } from '../types'

interface IGetAllHandler<T> extends IHandlerParams<T> {}

async function getAllHandler<T>({
  prismaDelegate,
  response,
}: IGetAllHandler<T>): Promise<void> {
  const resources = await prismaDelegate.findMany()

  response.status(200).send(resources)
}

export default getAllHandler
