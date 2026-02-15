export function loadEnvVariable(name: string): string;
export function loadEnvVariable(name: string, throwErrorOnUndefined: true): string;
export function loadEnvVariable(name: string, throwErrorOnUndefined: false): string | undefined;

export function loadEnvVariable(name: string, throwErrorOnUndefined: boolean = true) {
  const val = process.env[name];
  if (!val && throwErrorOnUndefined) {
    throw new Error(`${name} env-variable missing!`);
  }
  return val;
}
