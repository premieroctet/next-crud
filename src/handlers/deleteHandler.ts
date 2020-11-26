import { IUniqueResourceHandlerParams } from '../types'

interface IDeleteHandler<T> extends IUniqueResourceHandlerParams<T> {}

async function deleteHandler<T>({
  prismaDelegate,
  response,
  resourceId,
  primaryKey,
}: IDeleteHandler<T>): Promise<void> {
  const deletedResource = await prismaDelegate.delete({
    where: {
      [primaryKey]: resourceId,
    },
  })

  response.send(deletedResource)
}

export default deleteHandler
