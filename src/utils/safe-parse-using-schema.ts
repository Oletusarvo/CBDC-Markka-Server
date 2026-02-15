import z, { parse, ZodType } from 'zod';

type ReturnT<T> = [T, null] | [null, { errors: string[] }];
export const safeParseUsingSchema = <T extends Record<string, unknown>>(
  payload: T,
  schema: ZodType<T>
): ReturnT<T> => {
  const parseResult = schema.safeParse(payload);
  return !parseResult.success
    ? [null, z.treeifyError(parseResult.error)]
    : ([parseResult.data, null] as const);
};
