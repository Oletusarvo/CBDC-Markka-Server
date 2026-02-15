import { NextFunction } from 'express';
import { ExpressRequest, ExpressResponse } from '../types/handlers';
import { tryCatch } from './try-catch';

export function createMiddleware<R extends ExpressRequest = ExpressRequest>(
  handler: (req: R, res: ExpressResponse, next: NextFunction) => Promise<ExpressResponse | void>
) {
  return async (req: R, res: ExpressResponse, next: NextFunction) => {
    const [result, error] = await tryCatch(async () => await handler(req, res, next));
    if (error !== null) {
      console.log(error);
      return res.status(500).send('An unexpected error occured!');
    }
    return result;
  };
}
