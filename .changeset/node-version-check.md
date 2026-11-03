---
"releaseproof": patch
---

On a Node.js older than 22.12 the CLI now stops with `releaseproof needs Node.js 22.12 or newer; you are running <version>` and exit code 2, instead of failing inside a dependency with a confusing error.
