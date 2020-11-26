import { IHandlerParams } from '../types'

interface IGetOneHandler<T> extends IHandlerParams<T> {}

function getOneHandler<T>({
  prismaDelegate,
  response,
}: IGetOneHandler<T>): void {
  response.send('Get one handler')
}

export default getOneHandler
