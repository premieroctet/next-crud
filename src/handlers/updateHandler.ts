import { IUniqueResourceHandlerParams } from '../types'

interface IUpdateHandler<T> extends IUniqueResourceHandlerParams<T> {
  body: Partial<T>
}

async function updateHandler<T>({
  prismaDelegate,
  response,
  body,
  resourceId,
  primaryKey,
}: IUpdateHandler<T>): Promise<void> {
  const updatedResource = await prismaDelegate.update({
    where: {
      [primaryKey]: resourceId,
    },
    data: body,
  })

  response.send(updatedResource)
}

export default updateHandler
