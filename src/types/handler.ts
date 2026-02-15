import { NextFunction } from 'express';
import { AuthenticatedExpressRequest, ExpressRequest, ExpressResponse } from './express';

export type THandler<Req extends ExpressRequest | AuthenticatedExpressRequest = ExpressRequest> = (
  req: Req,
  res: ExpressResponse
) => Promise<ExpressResponse>;

export type TMiddlewareHandler<
  Req extends ExpressRequest | AuthenticatedExpressRequest = ExpressRequest
> = (req: Req, res: ExpressResponse, next: NextFunction) => Promise<void | ExpressResponse>;
