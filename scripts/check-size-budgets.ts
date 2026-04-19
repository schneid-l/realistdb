import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

interface PackageJson {
	name?: string;
	private?: boolean;
	scripts?: Record<string, string>;
}

interface Violation {
	pkg: string;
	path: string;
	reason: string;
}

export interface CheckResult {
	ok: boolean;
	violations: Violation[];
}

export function checkSizeBudgets(opts: { root: string }): CheckResult {
	const violations: Violation[] = [];
	const packagesDir = join(opts.root, "packages");
	if (!existsSync(packagesDir)) {
		return { ok: true, violations };
	}
	for (const dir of findPublishablePackages(packagesDir)) {
		const rel = relative(opts.root, dir).replaceAll(sep, "/");
		const pkgJsonPath = join(dir, "package.json");
		const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf8")) as PackageJson;
		if (pkg.private === true) {
			continue;
		}
		const hasConfig =
			existsSync(join(dir, "size-limit.config.ts")) ||
			existsSync(join(dir, "size-limit.config.js")) ||
			existsSync(join(dir, "size-limit.config.mjs"));
		if (!hasConfig) {
			violations.push({
				pkg: pkg.name ?? rel,
				path: rel,
				reason: "missing size-limit.config.{ts,js,mjs}",
			});
			continue;
		}
		if (!pkg.scripts?.["check:size"]) {
			violations.push({
				pkg: pkg.name ?? rel,
				path: rel,
				reason: "missing 'check:size' script in package.json",
			});
		}
	}
	return { ok: violations.length === 0, violations };
}

function findPublishablePackages(packagesDir: string): string[] {
	const out: string[] = [];
	for (const entry of readdirSync(packagesDir)) {
		const full = join(packagesDir, entry);
		if (!statSync(full).isDirectory()) {
			continue;
		}
		// Internal config packages are exempt by convention: they live in
		// packages/config/* and are never published.
		if (entry === "config") {
			continue;
		}
		if (existsSync(join(full, "package.json"))) {
			out.push(full);
		}
	}
	return out;
}

if (import.meta.main) {
	const result = checkSizeBudgets({ root: process.cwd() });
	if (result.ok) {
		console.log("✓ every publishable package declares a size budget");
		process.exit(0);
	}
	console.error("✗ size-budget violations:");
	for (const v of result.violations) {
		console.error(`  ${v.path} (${v.pkg}): ${v.reason}`);
	}
	console.error(
		"\nEvery non-private package under packages/* (excluding packages/config/*)\nmust ship a size-limit.config.{ts,js,mjs} and a 'check:size' script.",
	);
	process.exit(1);
}
