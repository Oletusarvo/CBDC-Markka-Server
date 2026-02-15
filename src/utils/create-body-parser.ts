import z, { ZodType } from 'zod';
import { createMiddleware } from './create-handler';

/**
 * Generates a middleware-function using the provided zod-schema to validate the body of requests, including it as the data-parameter of the request.
 * @param schema
 * @returns
 */
export function createBodyParser(schema: ZodType) {
  return createMiddleware(async (req, res, next) => {
    const parseResult = schema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json(z.treeifyError(parseResult.error));
    }
    req.data = parseResult.data;
    next();
  });
}
