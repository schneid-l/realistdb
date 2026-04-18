import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkCatalog } from "../check-catalog.ts";

function fixture(files: Record<string, unknown>): string {
	const dir = mkdtempSync(join(tmpdir(), "rdb-check-catalog-"));
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

describe("checkCatalog", () => {
	test("passes when every external dep uses catalog: or workspace:*", () => {
		const dir = fixture({
			"package.json": {
				workspaces: {
					catalog: { typescript: "5.7.2" },
					catalogs: { testing: { vitest: "3.0.0" } },
				},
			},
			"packages/a/package.json": {
				name: "@realistdb/a",
				dependencies: { typescript: "catalog:" },
				devDependencies: {
					vitest: "catalog:testing",
					"@realistdb/b": "workspace:*",
				},
			},
		});
		const result = checkCatalog({ root: dir });
		expect(result.ok).toBe(true);
		expect(result.violations).toEqual([]);
	});

	test("fails when a dep uses a raw version string", () => {
		const dir = fixture({
			"package.json": { workspaces: { catalog: { typescript: "5.7.2" } } },
			"packages/a/package.json": {
				name: "@realistdb/a",
				dependencies: { lodash: "4.17.21" },
			},
		});
		const result = checkCatalog({ root: dir });
		expect(result.ok).toBe(false);
		expect(result.violations).toContainEqual({
			file: "packages/a/package.json",
			dep: "lodash",
			value: "4.17.21",
			reason: "must use catalog: or workspace:*",
		});
	});

	test("fails when catalog: points to a non-existent named catalog", () => {
		const dir = fixture({
			"package.json": {
				workspaces: { catalog: {}, catalogs: { build: {} } },
			},
			"packages/a/package.json": {
				name: "@realistdb/a",
				dependencies: { foo: "catalog:nonexistent" },
			},
		});
		const result = checkCatalog({ root: dir });
		expect(result.ok).toBe(false);
		expect(result.violations[0]?.reason).toContain(
			"unknown catalog 'nonexistent'",
		);
	});

	test("fails when catalog: references a package not in the catalog", () => {
		const dir = fixture({
			"package.json": { workspaces: { catalog: {} } },
			"packages/a/package.json": {
				name: "@realistdb/a",
				dependencies: { typescript: "catalog:" },
			},
		});
		const result = checkCatalog({ root: dir });
		expect(result.ok).toBe(false);
		expect(result.violations[0]?.reason).toContain(
			"not defined in default catalog",
		);
	});

	test("ignores the root package.json's own workspaces block", () => {
		const dir = fixture({
			"package.json": {
				workspaces: {
					packages: ["packages/**"],
					catalog: { typescript: "5.7.2" },
				},
				devDependencies: { typescript: "catalog:" },
			},
		});
		const result = checkCatalog({ root: dir });
		expect(result.ok).toBe(true);
	});
});
