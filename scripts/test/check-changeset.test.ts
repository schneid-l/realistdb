import { describe, expect, test } from "bun:test";
import { checkChangeset } from "../check-changeset.ts";

describe("checkChangeset", () => {
  test("passes when no packages/* files change", () => {
    const r = checkChangeset({
      changedFiles: ["docs/src/content/docs/index.mdx", "README.md"],
      changesetFiles: [],
    });
    expect(r.ok).toBe(true);
  });

  test("passes when packages/* change has a changeset", () => {
    const r = checkChangeset({
      changedFiles: ["packages/config/tsconfig/base.json"],
      changesetFiles: [".changeset/cool-fox.md"],
    });
    expect(r.ok).toBe(true);
  });

  test("fails when packages/* change has no changeset", () => {
    const r = checkChangeset({
      changedFiles: ["packages/core/src/index.ts"],
      changesetFiles: [],
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.reason).toContain("no changeset");
    }
  });

  test("ignores docs, markdown, and test-only changes", () => {
    const r = checkChangeset({
      changedFiles: [
        "packages/core/test/x.test.ts",
        "docs/src/content/docs/guides/g.mdx",
      ],
      changesetFiles: [],
    });
    expect(r.ok).toBe(true);
  });
});
