<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [ssr-only-secrets](./ssr-only-secrets.md) &gt; [readSSROnlySecret](./ssr-only-secrets.readssronlysecret.md)

## readSSROnlySecret() function

Decrypts a secret that was created in a Server Component using `cloakSSROnlySecret`<!-- -->.

Calling this in a Browser environment will always return `undefined`<!-- -->.

Only available in Client Components.

**Signature:**

```typescript
export declare function readSSROnlySecret(cloakedSecret: string | undefined, encryptionEnvVarName: string): Promise<string | undefined>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  cloakedSecret | string \| undefined |  |
|  encryptionEnvVarName | string |  |

**Returns:**

Promise&lt;string \| undefined&gt;

