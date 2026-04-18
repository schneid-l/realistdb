# @realistdb/tsdown-config

Shared tsdown preset for publishable packages.

```ts
import { libraryConfig } from "@realistdb/tsdown-config";
export default libraryConfig({ entry: "src/index.ts" });
```

Defaults: ESM-only, neutral platform, dts via oxc (requires `isolatedDeclarations`), sourcemaps, tree-shaking on, clean `dist/`.
