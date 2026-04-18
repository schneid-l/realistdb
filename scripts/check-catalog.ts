import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

interface PackageJson {
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
	name?: string;
	optionalDependencies?: Record<string, string>;
	peerDependencies?: Record<string, string>;
	workspaces?: {
		packages?: string[];
		catalog?: Record<string, string>;
		catalogs?: Record<string, Record<string, string>>;
	};
}

interface Violation {
	dep: string;
	file: string;
	reason: string;
	value: string;
}

export interface CheckResult {
	ok: boolean;
	violations: Violation[];
}

const SKIP_DIRS: ReadonlySet<string> = new Set([
	"node_modules",
	".git",
	"dist",
	".turbo",
	"coverage",
	".astro",
]);

export function checkCatalog(opts: { root: string }): CheckResult {
	const rootPkg = JSON.parse(
		readFileSync(join(opts.root, "package.json"), "utf8"),
	) as PackageJson;
	const defaultCatalog = rootPkg.workspaces?.catalog ?? {};
	const namedCatalogs = rootPkg.workspaces?.catalogs ?? {};

	const violations: Violation[] = [];
	for (const abs of findPackageJsons(opts.root)) {
		// Normalize to forward slashes so violation output and test assertions
		// are identical on Windows, macOS, and Linux.
		const rel = relative(opts.root, abs).replaceAll(sep, "/");
		const pkg =
			rel === "package.json"
				? rootPkg
				: (JSON.parse(readFileSync(abs, "utf8")) as PackageJson);
		checkDeps(pkg, rel, defaultCatalog, namedCatalogs, violations);
	}
	return { ok: violations.length === 0, violations };
}

const DEP_FIELDS: readonly (keyof PackageJson)[] = [
	"dependencies",
	"devDependencies",
	"peerDependencies",
	"optionalDependencies",
];

function checkDeps(
	pkg: PackageJson,
	file: string,
	defaultCatalog: Record<string, string>,
	namedCatalogs: Record<string, Record<string, string>>,
	violations: Violation[],
): void {
	for (const field of DEP_FIELDS) {
		const deps = pkg[field] as Record<string, string> | undefined;
		if (!deps) {
			continue;
		}
		for (const [dep, value] of Object.entries(deps)) {
			const violation = classify(dep, value, defaultCatalog, namedCatalogs);
			if (violation) {
				violations.push({ file, dep, value, reason: violation });
			}
		}
	}
}

function classify(
	dep: string,
	value: string,
	defaultCatalog: Record<string, string>,
	namedCatalogs: Record<string, Record<string, string>>,
): string | undefined {
	if (value.startsWith("workspace:")) {
		return;
	}
	if (!value.startsWith("catalog:")) {
		return "must use catalog: or workspace:*";
	}
	const name = value.slice("catalog:".length);
	if (name === "") {
		return dep in defaultCatalog
			? undefined
			: `dep '${dep}' uses catalog: but is not defined in default catalog`;
	}
	const catalog = namedCatalogs[name];
	if (!catalog) {
		return `unknown catalog '${name}'`;
	}
	return dep in catalog
		? undefined
		: `dep '${dep}' not defined in catalog '${name}'`;
}

function findPackageJsons(root: string): string[] {
	const out: string[] = [];
	const stack: string[] = [root];
	while (stack.length > 0) {
		const dir = stack.pop() ?? "";
		for (const entry of readdirSync(dir)) {
			if (SKIP_DIRS.has(entry)) {
				continue;
			}
			const full = join(dir, entry);
			const st = statSync(full);
			if (st.isDirectory()) {
				stack.push(full);
			} else if (entry === "package.json") {
				out.push(full);
			}
		}
	}
	return out;
}

if (import.meta.main) {
	const result = checkCatalog({ root: process.cwd() });
	if (result.ok) {
		console.log("✓ every dep is in a catalog or workspace");
		process.exit(0);
	}
	console.error("✗ catalog violations:");
	for (const v of result.violations) {
		console.error(`  ${v.file}: ${v.dep}@${v.value} — ${v.reason}`);
	}
	process.exit(1);
}
