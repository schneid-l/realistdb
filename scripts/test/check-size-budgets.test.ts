import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkSizeBudgets } from "../check-size-budgets.ts";

function fixture(files: Record<string, unknown>): string {
	const dir = mkdtempSync(join(tmpdir(), "rdb-check-size-"));
	for (const [rel, content] of Object.entries(files)) {
		const full = join(dir, rel);
		mkdirSync(join(full, ".."), { recursive: true });
		writeFileSync(
			full,
			typeof content === "string" ? content : JSON.stringify(content, null, 2),
		);
	}
	return dir;
}

describe("checkSizeBudgets", () => {
	test("passes when there are no packages at all", () => {
		const dir = fixture({ "package.json": { name: "root" } });
		const result = checkSizeBudgets({ root: dir });
		expect(result.ok).toBe(true);
	});

	test("ignores private packages", () => {
		const dir = fixture({
			"packages/core/package.json": {
				name: "@realistdb/core",
				private: true,
			},
		});
		const result = checkSizeBudgets({ root: dir });
		expect(result.ok).toBe(true);
	});

	test("ignores packages/config/* tree", () => {
		const dir = fixture({
			"packages/config/biome/package.json": {
				name: "@realistdb/biome-config",
			},
		});
		const result = checkSizeBudgets({ root: dir });
		expect(result.ok).toBe(true);
	});

	test("fails when a publishable package has no size-limit config", () => {
		const dir = fixture({
			"packages/core/package.json": {
				name: "@realistdb/core",
				scripts: { "check:size": "size-limit" },
			},
		});
		const result = checkSizeBudgets({ root: dir });
		expect(result.ok).toBe(false);
		expect(result.violations[0]?.reason).toContain("missing size-limit.config");
	});

	test("fails when a publishable package has no check:size script", () => {
		const dir = fixture({
			"packages/core/package.json": { name: "@realistdb/core" },
			"packages/core/size-limit.config.ts": "export default [];",
		});
		const result = checkSizeBudgets({ root: dir });
		expect(result.ok).toBe(false);
		expect(result.violations[0]?.reason).toContain("missing 'check:size'");
	});

	test("passes when a publishable package has both config and script", () => {
		const dir = fixture({
			"packages/core/package.json": {
				name: "@realistdb/core",
				scripts: { "check:size": "size-limit" },
			},
			"packages/core/size-limit.config.ts": "export default [];",
		});
		const result = checkSizeBudgets({ root: dir });
		expect(result.ok).toBe(true);
	});
});
