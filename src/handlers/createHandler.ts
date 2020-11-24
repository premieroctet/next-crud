import { HandlerParams } from '../types'

interface CreateHandler<T> extends HandlerParams<T> {}

function createHandler<T>({
  prismaDelegate,
  response,
}: CreateHandler<T>): void {
  response.send('Create handler')
}

export default createHandler
