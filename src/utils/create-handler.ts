import { NextFunction } from 'express';
import { AuthenticatedExpressRequest, ExpressRequest, ExpressResponse } from '../types/express';
import { tryCatch } from './try-catch';
import { THandler, TMiddlewareHandler } from '../types/handler';

type TErrorHandler = (err: any, res: ExpressResponse) => ExpressResponse | void;

const runHandler = async <THandlerRet>(
  res: ExpressResponse,
  handler: () => Promise<THandlerRet>,
  onError?: TErrorHandler
) => {
  const [result, err] = await tryCatch(async () => await handler());
  if (err !== null) {
    console.log(err.message);
    const errorResponse = onError ? onError(err, res) : null;
    if (errorResponse) {
      return errorResponse;
    }

    return res.status(500).end();
  }
  return result;
};

/**
 * Creates a route-handler that internally catches errors.
 * @param handler
 * @param onError
 * @returns
 */
export function createHandler<
  Req extends ExpressRequest | AuthenticatedExpressRequest = ExpressRequest
>(handler: THandler<Req>, onError?: TErrorHandler) {
  return async (req: ExpressRequest, res: ExpressResponse) => {
    return await runHandler(res, async () => await handler(req as Req, res), onError);
  };
}

/**
 * Creates a middleware-function that internally catches errors.
 * @param handler
 * @returns
 */
export function createMiddleware<
  Req extends ExpressRequest | AuthenticatedExpressRequest = ExpressRequest
>(handler: TMiddlewareHandler<Req>, onError?: TErrorHandler) {
  return async (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
    return await runHandler(res, async () => await handler(req as Req, res, next), onError);
  };
}
