import { Request, Response } from 'express';
import { TSession } from './session';
import { ZodSafeParseResult } from 'zod';

export type ExpressResponse = Response;
export type ExpressRequest = Request;
export type ExpressRequestWithAuth = ExpressRequest & {
  session: TSession;
};
export type ExpressRequestWithPayload<T extends Record<string, unknown>> =
  ExpressRequestWithAuth & {
    payload: T;
  };
