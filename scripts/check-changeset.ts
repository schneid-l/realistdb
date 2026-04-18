import { execFileSync } from "node:child_process";

interface CheckInput {
	changedFiles: string[];
	changesetFiles: string[];
}

type CheckResult = { ok: true } | { ok: false; reason: string };

const PKG_SRC = /^packages\/[^/]+\/.+/;
const CONFIG_PKG_SRC = /^packages\/config\/[^/]+\/.+/;
const TEST_DIR = /\/test\//;
const TEST_FILE = /\.test\.ts$/;

function isProductChange(path: string): boolean {
	if (path.startsWith("docs/")) {
		return false;
	}
	if (path.endsWith(".md")) {
		return false;
	}
	if (TEST_DIR.test(path) || TEST_FILE.test(path)) {
		return false;
	}
	return PKG_SRC.test(path) || CONFIG_PKG_SRC.test(path);
}

export function checkChangeset(input: CheckInput): CheckResult {
	const productChanges = input.changedFiles.filter(isProductChange);
	if (productChanges.length === 0) {
		return { ok: true };
	}
	const hasChangeset = input.changesetFiles.some(
		(f) =>
			f.startsWith(".changeset/") &&
			f.endsWith(".md") &&
			f !== ".changeset/README.md",
	);
	if (hasChangeset) {
		return { ok: true };
	}
	return {
		ok: false,
		reason: `packages/* changes with no changeset:\n  ${productChanges.join("\n  ")}`,
	};
}

function diffNames(base: string): string[] {
	return execFileSync("git", ["diff", "--name-only", `${base}...HEAD`], {
		encoding: "utf8",
	})
		.split("\n")
		.filter(Boolean);
}

if (import.meta.main) {
	// GITHUB_BASE_REF is the target branch name (e.g. "main"); CI checkout has
	// it only as a remote-tracking ref, so prepend "origin/". Falls back to
	// "origin/main" for local invocations where the env var isn't set.
	const envBase = process.env.GITHUB_BASE_REF;
	const base = envBase ? `origin/${envBase}` : "origin/main";
	const diff = diffNames(base);
	const changeset = diff.filter(
		(f) => f.startsWith(".changeset/") && f.endsWith(".md"),
	);
	const result = checkChangeset({
		changedFiles: diff,
		changesetFiles: changeset,
	});
	if (result.ok) {
		console.log("✓ changeset policy satisfied");
		process.exit(0);
	}
	console.error(`✗ ${result.reason}`);
	console.error("\nRun: bun run changeset");
	process.exit(1);
}
