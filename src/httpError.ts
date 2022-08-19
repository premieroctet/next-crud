import * as http from 'http'
import { ApiError } from 'next/dist/server/api-utils'

export default class HttpError extends ApiError {
  statusCode: number

  constructor(code: number, message?: string) {
    super(code, `${http.STATUS_CODES[code]}: ${message}`)
    this.name = 'HttpError'
    this.statusCode = code
  }
}
