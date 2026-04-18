import { describe, expect, test } from "bun:test";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { scaffoldPackage } from "../new-package.ts";

function seedTemplate(dir: string): void {
	const tpl = join(dir, "scripts/templates/package");
	mkdirSync(join(tpl, "src"), { recursive: true });
	mkdirSync(join(tpl, "test"), { recursive: true });
	writeFileSync(
		join(tpl, "package.json"),
		JSON.stringify(
			{
				name: "@realistdb/{{packageName}}",
				description: "{{description}}",
			},
			null,
			2,
		),
	);
	writeFileSync(
		join(tpl, "src/index.ts"),
		'export const name = "{{packageName}}";\n',
	);
	writeFileSync(join(tpl, "test/index.test.ts"), "// {{packageName}}\n");
	writeFileSync(join(tpl, "README.md"), "# {{packageName}}\n{{description}}\n");
}

describe("scaffoldPackage", () => {
	test("substitutes placeholders and creates target dir", () => {
		const dir = mkdtempSync(join(tmpdir(), "rdb-scaffold-"));
		mkdirSync(join(dir, ".changeset"), { recursive: true });
		writeFileSync(join(dir, ".changeset/config.json"), "{}");
		seedTemplate(dir);

		scaffoldPackage({
			root: dir,
			name: "core",
			description: "Core types",
			kind: "library",
		});

		const pkg = JSON.parse(
			readFileSync(join(dir, "packages/core/package.json"), "utf8"),
		);
		expect(pkg.name).toBe("@realistdb/core");
		expect(pkg.description).toBe("Core types");
		expect(
			readFileSync(join(dir, "packages/core/src/index.ts"), "utf8"),
		).toContain('export const name = "core";');
		expect(existsSync(join(dir, ".changeset/core-initial.md"))).toBe(true);
	});

	test("refuses invalid names", () => {
		const dir = mkdtempSync(join(tmpdir(), "rdb-scaffold-"));
		seedTemplate(dir);
		expect(() =>
			scaffoldPackage({
				root: dir,
				name: "Bad_Name",
				description: "x",
				kind: "library",
			}),
		).toThrow("must be kebab-case");
	});

	test("refuses names that collide", () => {
		const dir = mkdtempSync(join(tmpdir(), "rdb-scaffold-"));
		mkdirSync(join(dir, ".changeset"), { recursive: true });
		writeFileSync(join(dir, ".changeset/config.json"), "{}");
		seedTemplate(dir);
		scaffoldPackage({
			root: dir,
			name: "x",
			description: "first",
			kind: "library",
		});
		expect(() =>
			scaffoldPackage({
				root: dir,
				name: "x",
				description: "second",
				kind: "library",
			}),
		).toThrow("already exists");
	});

	test("routes kind='config' into packages/config/", () => {
		const dir = mkdtempSync(join(tmpdir(), "rdb-scaffold-"));
		mkdirSync(join(dir, ".changeset"), { recursive: true });
		writeFileSync(join(dir, ".changeset/config.json"), "{}");
		seedTemplate(dir);
		scaffoldPackage({
			root: dir,
			name: "foo-config",
			description: "x",
			kind: "config",
		});
		expect(
			existsSync(join(dir, "packages/config/foo-config/package.json")),
		).toBe(true);
	});
});
