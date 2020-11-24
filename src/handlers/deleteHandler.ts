import { HandlerParams } from '../types'

interface DeleteHandler<T> extends HandlerParams<T> {}

function deleteHandler<T>({
  prismaDelegate,
  response,
}: DeleteHandler<T>): void {
  response.send('Delete handler')
}

export default deleteHandler
