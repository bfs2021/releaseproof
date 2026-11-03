---
"releaseproof": patch
---

`releaseproof check --token` now prints a warning on stderr: a token on the command line ends up in shell history and process lists, so prefer `NPM_TOKEN` or `npm login`. `--quiet` suppresses it.
