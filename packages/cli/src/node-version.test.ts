import { ExitCode } from "@releaseproof/core";
import { describe, expect, it } from "vitest";
import pkg from "../package.json" with { type: "json" };
import { EXIT_TOOL_ERROR, MIN_NODE_VERSION, nodeVersionProblem } from "./node-version.js";

describe("nodeVersionProblem", () => {
  it.each(["22.12.0", "22.12.1", "22.13.0", "23.0.0", "24.4.1", "v22.12.0", process.versions.node])(
    "accepts %s",
    (version) => {
      expect(nodeVersionProblem(version)).toBeUndefined();
    },
  );

  it.each(["22.11.9", "22.0.0", "20.18.1", "18.19.0", "v16.20.2"])("rejects %s", (version) => {
    expect(nodeVersionProblem(version)).toBe(
      `releaseproof needs Node.js 22.12 or newer; you are running ${version}`,
    );
  });

  it("rejects a version it cannot parse rather than guessing", () => {
    expect(nodeVersionProblem("unknown")).toMatch(/needs Node.js 22.12 or newer/);
  });

  it("uses the minimum from package.json engines.node", () => {
    expect(pkg.engines.node).toBe(`>=${MIN_NODE_VERSION}`);
  });

  it("exits with the tool-error code", () => {
    expect(EXIT_TOOL_ERROR).toBe(ExitCode.ToolError);
  });
});
