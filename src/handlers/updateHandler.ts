import { IHandlerParams } from '../types'

interface IUpdateHandler<T> extends IHandlerParams<T> {}

function updateHandler<T>({
  prismaDelegate,
  response,
}: IUpdateHandler<T>): void {
  response.send('Update handler')
}

export default updateHandler
