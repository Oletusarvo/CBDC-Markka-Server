type TRet<T> = [T, null] | [null, Error];

export async function tryCatch<T>(callback: () => T | Promise<T>): Promise<TRet<T>> {
  try {
    const res = await callback();
    return [res, null] as const;
  } catch (err: any) {
    return [null, err] as const;
  }
}
