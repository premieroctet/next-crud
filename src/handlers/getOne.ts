import { HandlerParams } from '../types'

interface GetOneHandler<T> extends HandlerParams<T> {}

function getOneHandler<T>({
  prismaDelegate,
  response,
}: GetOneHandler<T>): void {
  response.send('Get one handler')
}

export default getOneHandler
