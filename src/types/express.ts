import { Request, Response } from 'express';
import { TSession } from './session';

type TData = Record<string, unknown>;

export type ExpressRequest<T extends TData = any> = Request & {
  data?: T;
};

export type AuthenticatedExpressRequest<T extends TData = any> = ExpressRequest<T> & {
  session: TSession;
};

export type ExpressResponse = Response;
