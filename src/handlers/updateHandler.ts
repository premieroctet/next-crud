import { HandlerParams } from '../types'

interface UpdateHandler<T> extends HandlerParams<T> {}

function updateHandler<T>({
  prismaDelegate,
  response,
}: UpdateHandler<T>): void {
  response.send('Update handler')
}

export default updateHandler
