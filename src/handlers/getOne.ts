import { IUniqueResourceHandlerParams } from '../types'

interface IGetOneHandler<T> extends IUniqueResourceHandlerParams<T> {}

async function getOneHandler<T>({
  prismaDelegate,
  response,
  resourceId,
  primaryKey,
}: IGetOneHandler<T>): Promise<void> {
  /**
   * On prisma v2.12, findOne has been deprecated in favor of findUnique
   * We use findUnique in priority only if it's available
   */
  const findFn = prismaDelegate.findUnique || prismaDelegate.findOne

  const resource = await findFn({
    where: {
      [primaryKey]: resourceId,
    },
  })

  response.send(resource)
}

export default getOneHandler
