import { wrap } from "optimism";
import { deserialize, getEncryptionKey } from "./shared.js";
import { use, useRef } from "react";

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
  setTimeout(
    // To prevent the `memoizedReadSSROnlySecret` cache from growing too large,
    // we evict the memoization cache entry after 5 seconds.
    // This should be enough for React to mount the component and finish rendering,
    // but not too long to keep the cache from growing indefinitely.
    // There might be edge case situations where the component tree stays suspended
    // for longer than five seconds, in which case the cache entry will be evicted
    // before the component is mounted, and the work has to be done again - but
    // this should be rare and a reasonable tradeoff.
    () => memoizedReadSSROnlySecret.forget(cloakedSecret, encryptionEnvVarName),
    5000
  );

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
});

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
  cloakedSecret: string | undefined,
  encryptionEnvVarName: string
): string | undefined {
  // Store the promiseRef in a ref.
  // This won't do anything meaningful during SSR, but it will
  // ensure that the promise is never recreated in the browser,
  // even if it is collected from the memoization cache.
  const promiseRef = useRef<Promise<string | undefined>>();
  if (!promiseRef.current) {
    promiseRef.current = memoizedReadSSROnlySecret(
      cloakedSecret,
      encryptionEnvVarName
    );
  }
  return use(promiseRef.current);
}
