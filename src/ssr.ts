import { wrap } from "optimism";
import { deserialize, getEncryptionKey } from "./shared";
import { use } from "react";

/**
 * Decrypts a secret that was created in a Server Component using
 * `cloakSSROnlySecret`.
 *
 * Calling this in a Browser environment will always return `undefined`.
 *
 * Only available in Client Components.
 *
 * @public
 */
export async function readSSROnlySecret(
  cloakedSecret: string | undefined,
  encryptionEnvVarName: string
): Promise<string | undefined> {
  if (cloakedSecret == undefined) {
    return undefined;
  }
  const key = await getEncryptionKey(encryptionEnvVarName);
  const [crypt, iv] = deserialize(cloakedSecret);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-CBC",
      iv: iv,
    },
    key,
    crypt
  );

  return new TextDecoder().decode(decrypted);
}

/**
 * We need to memoize the promises returned from `readSSROnlySecret` to avoid
 * an infinite render circle with `use`.
 * We use the `optimism` package for this.
 * We assume that `10000` is a reasonable maximum number of secrets that will be
 * read simultaneously, but this value might need increasing in the future depending
 * on how this is used.
 */
const memoizedReadSSROnlySecret = wrap(readSSROnlySecret, {
  max: 10000,
}) as any as typeof readSSROnlySecret;

/**
 * Decrypts a secret that was created in a Server Component using
 * `cloakSSROnlySecret`.
 * If called during SSR, this hook will briefly suspend your component and
 * then return the decrypted secret.
 *
 * Calling this in a Browser environment will always return `undefined`.
 *
 * Only available in Client Components.
 *
 * @public
 */
export function useSSROnlySecret(
  cloakedSecret: string,
  encryptionEnvVarName: string
): string | undefined {
  const promise = memoizedReadSSROnlySecret(
    cloakedSecret,
    encryptionEnvVarName
  );
  return use(promise);
}
