#!/usr/bin/env node
// Check the Node.js version before loading the CLI: on an older Node the dependencies fail
// with confusing syntax or import errors. Static imports would load first, so the CLI is
// imported dynamically once the version is known to be fine.
import { EXIT_TOOL_ERROR, nodeVersionProblem } from "./node-version.js";

const problem = nodeVersionProblem(process.versions.node);
if (problem) {
  process.stderr.write(`${problem}\n`);
  process.exitCode = EXIT_TOOL_ERROR;
} else {
  await import("./main.js");
}
