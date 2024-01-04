import { experimental_taintUniqueValue } from "react";
import { getEncryptionKey, serialize } from "./shared.js";

declare module "react" {
  type TypedArray =
    | Int8Array
    | Uint8Array
    | Uint8ClampedArray
    | Int16Array
    | Uint16Array
    | Int32Array
    | Uint32Array
    | Float32Array
    | Float64Array
    | BigInt64Array
    | BigUint64Array;
  export const experimental_taintUniqueValue: (
    message: string,
    lifetime: object,
    value: string | bigint | TypedArray
  ) => void;
}

/**
 * Encrypts a secret so that it can be passed from Server Components into the
 * SSR-run of Client Components without them being accessible in the browser.
 *
 * Use `useSSROnlySecret` or `readSSROnlySecret` to decrypt the secret in your
 * Client Component.
 *
 * Only available in Server Components.
 *
 * @public
 */
export async function cloakSSROnlySecret(
  secret: string,
  encryptionEnvVarName: string
) {
  experimental_taintUniqueValue(
    `Do not pass the content of the envrionment variable "${encryptionEnvVarName}" directly into client component props. This is unsafe!`,
    process,
    secret
  );

  const key = await getEncryptionKey(encryptionEnvVarName);
  const encoded = new TextEncoder().encode(secret);

  const iv = crypto.getRandomValues(new Uint8Array(16));
  const crypt = crypto.subtle.encrypt(
    {
      name: "AES-CBC",
      iv: iv,
    },
    key,
    encoded
  );

  return serialize(await crypt, iv);
}
