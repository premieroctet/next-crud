import * as http from 'http'

export default class HttpError extends Error {
  statusCode: number

  constructor(code: number, message?: string) {
    super(`${http.STATUS_CODES[code]}: ${message}`)
    this.name = 'HttpError'
    this.statusCode = code
  }
}
