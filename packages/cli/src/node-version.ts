/**
 * The oldest Node.js the CLI supports. Must match `engines.node` in package.json; a test
 * keeps the two in sync. This module imports nothing, so it can run before anything else.
 */
export const MIN_NODE_VERSION = "22.12.0";

/** Same value as ExitCode.ToolError in core, which is not imported here on purpose. */
export const EXIT_TOOL_ERROR = 2;

function majorMinor(version: string): [number, number] | undefined {
  const match = /^v?(\d+)\.(\d+)/.exec(version);
  return match ? [Number(match[1]), Number(match[2])] : undefined;
}

/** The message to print when `version` is older than the minimum, or undefined when it is fine. */
export function nodeVersionProblem(
  version: string,
  minimum: string = MIN_NODE_VERSION,
): string | undefined {
  const [minMajor, minMinor] = majorMinor(minimum) ?? [0, 0];
  const current = majorMinor(version);
  if (current) {
    const [major, minor] = current;
    if (major > minMajor || (major === minMajor && minor >= minMinor)) {
      return undefined;
    }
  }
  return `releaseproof needs Node.js ${minMajor}.${minMinor} or newer; you are running ${version}`;
}
