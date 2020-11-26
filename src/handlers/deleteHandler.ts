import { IHandlerParams } from '../types'

interface IDeleteHandler<T> extends IHandlerParams<T> {}

function deleteHandler<T>({
  prismaDelegate,
  response,
}: IDeleteHandler<T>): void {
  response.send('Delete handler')
}

export default deleteHandler
