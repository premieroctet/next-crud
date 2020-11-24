import { HandlerParams } from '../types'

interface GetAllHandler<T> extends HandlerParams<T> {}

function getAllHandler<T>({
  prismaDelegate,
  response,
}: GetAllHandler<T>): void {
  response.send('Get all handlers')
}

export default getAllHandler
