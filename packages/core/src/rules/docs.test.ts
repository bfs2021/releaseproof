import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = path.dirname(fileURLToPath(import.meta.url));
const RULES_DOC = path.join(here, "../../../../docs/rules.md");
const KEBAB_ID = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

/** Every `id: "<kebab-case>"` literal in the rule sources (tests excluded). */
function ruleIdsInCode(dir: string = here): Set<string> {
  const ids = new Set<string>();
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".ts") || file.endsWith(".test.ts")) {
      continue;
    }
    const source = readFileSync(path.join(dir, file), "utf8");
    for (const match of source.matchAll(/\bid: "([a-z0-9-]+)"/g)) {
      ids.add(match[1] as string);
    }
  }
  return ids;
}

/**
 * Every id in the first column of the rule tables in docs/rules.md: tables whose header's
 * first cell is "Id". Other backticked words in a row (script names, paths) are not ids.
 */
function ruleIdsInDocs(markdown: string): Set<string> {
  const ids = new Set<string>();
  let inRuleTable = false;
  for (const line of markdown.split("\n")) {
    if (!line.startsWith("|")) {
      inRuleTable = false;
      continue;
    }
    const first = line.split("|")[1]?.trim() ?? "";
    if (first === "Id") {
      inRuleTable = true;
      continue;
    }
    if (!inRuleTable || /^-+$/.test(first)) {
      continue;
    }
    for (const match of first.matchAll(/`([^`]+)`/g)) {
      ids.add(match[1] as string);
    }
  }
  return ids;
}

function difference(a: Set<string>, b: Set<string>): string[] {
  return [...a].filter((id) => !b.has(id)).sort();
}

describe("docs/rules.md", () => {
  const inCode = ruleIdsInCode();
  const inDocs = ruleIdsInDocs(readFileSync(RULES_DOC, "utf8"));

  it("finds the rule ids on both sides", () => {
    expect(inCode.size).toBeGreaterThan(30);
    expect(inCode).toContain("install-script-added");
    expect(inDocs).toContain("install-script-added");
  });

  it("documents every rule id the code can report", () => {
    const undocumented = difference(inCode, inDocs);
    expect(undocumented, `rule ids missing from docs/rules.md: ${undocumented.join(", ")}`).toEqual(
      [],
    );
  });

  it("documents no rule id the code does not have", () => {
    const stale = difference(inDocs, inCode);
    expect(stale, `docs/rules.md lists ids the code never reports: ${stale.join(", ")}`).toEqual(
      [],
    );
  });

  it("writes every documented id in kebab case", () => {
    expect([...inDocs].filter((id) => !KEBAB_ID.test(id))).toEqual([]);
  });

  it("reads only the first column of rule tables", () => {
    const ids = ruleIdsInDocs(
      [
        "| Verdict | Exit code |",
        "| --- | --- |",
        "| `MATCHES SOURCE` | 0 |",
        "",
        "| Id | Severity | Triggers when |",
        "| --- | --- | --- |",
        "| `a-rule` / `b-rule` | high | `preinstall` or `.npmrc` |",
        "",
        "Text with `not-an-id`.",
      ].join("\n"),
    );
    expect([...ids]).toEqual(["a-rule", "b-rule"]);
  });
});
