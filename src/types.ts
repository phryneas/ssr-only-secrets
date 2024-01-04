/**
 * This package provides a way to pass secrets from Server Components into the
 * SSR-run of Client Components without them being accessible in the browser.
 * 
 * @remarks
 * Usage:
 *
 * Generate a jwk-formatted AES-CBC key, e.g. by running
```js
crypto.subtle
  .generateKey(
    {
      name: "AES-CBC",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  )
  .then((key) => crypto.subtle.exportKey("jwk", key))
  .then(JSON.stringify)
  .then(console.log);
```
 * and store the result in an environment variable, e.g. `SECRET_KEY`, e.g. by 
 * writing it into your `.env.local`.
```env
SECRET_KEY={"alg":"A256CBC","ext":true,"k":"...","key_ops":["encrypt","decrypt"],"kty":"oct"}
```
 *
 * Now, you can pass "cloaked secrets" from your Server Components into the
 * SSR-run of your Client Components, without them being accessible in your
 * Client Components in the browser.
 * 
 * @example
 * In a Server Component:
```jsx
const MyServerComponent = () => {
    const secretValue = "my secret value"
    return <ClientComponent ssrOnlySecret={cloakSSROnlySecret(secretValue, "SECRET_KEY")} />
}
```
 * And in a Client Component
```jsx
const ClientComponent = ({ssrOnlySecret}) => {
    const value = useSSROnlySecret(ssrOnlySecret);
    console.log(value); // during SSR, this logs "my secret value", but in the browser, it logs "undefined"
}
```
  * Alternatively, you can decrypt the secret in your code by calling `readSSROnlySecret`, e.g. in an Apollo Link:
```jsx
const value = await readSSROnlySecret(ssrOnlySecret)
```
@packageDocumentation
 */
/**
 * @internal
 */
export const _ = undefined;
export * from "./ssr.js";
export * from "./rsc.js";