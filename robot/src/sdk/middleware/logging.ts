import { ClientMiddlewareCall, CallOptions, ClientError, Status } from 'nice-grpc'
import { isAbortError } from 'abort-controller-x'
import { Logger } from 'winston'

function createLoggingMiddleware(logger: Logger) {
  return async function* loggingMiddleware<Request, Response>(
    call: ClientMiddlewareCall<Request, Response>,
    options: CallOptions
  ) {
    const { path } = call.method
    logger.info('Запрос', { path, request: call.request })
    try {
      return yield* call.next(call.request, options)
    } catch (error) {
      if (error instanceof ClientError) {
        logger.error('Ошибка', {
          path,
          status: 'error',
          error: { code: Status[error.code], details: error.details },
        })
      } else if (isAbortError(error)) {
        logger.error('Отмена', { path, status: 'cancel' })
      } else {
        logger.error('Ошибка', { path, status: 'error', error: error })
      }
      throw error
    }
  }
}

export default createLoggingMiddleware
