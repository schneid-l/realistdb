import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { join, relative } from "node:path";

export type Kind = "library" | "config" | "plugin";

export interface ScaffoldInput {
	description: string;
	kind: Kind;
	name: string;
	root: string;
}

const NAME_RE = /^[a-z][a-z0-9-]*$/;

export function scaffoldPackage(input: ScaffoldInput): void {
	if (!NAME_RE.test(input.name)) {
		throw new Error(`package name must be kebab-case (got '${input.name}')`);
	}
	const target = targetPath(input);
	if (existsSync(target)) {
		throw new Error(
			`package directory already exists: ${relative(input.root, target)}`,
		);
	}
	const templateDir = join(input.root, "scripts/templates/package");
	if (!existsSync(templateDir)) {
		throw new Error(`template missing at ${templateDir}`);
	}
	mkdirSync(target, { recursive: true });
	copyWithSubstitution(templateDir, target, {
		packageName: input.name,
		description: input.description,
	});
	writeChangeset(input);
}

function targetPath(input: ScaffoldInput): string {
	return input.kind === "config"
		? join(input.root, "packages/config", input.name)
		: join(input.root, "packages", input.name);
}

function copyWithSubstitution(
	from: string,
	to: string,
	vars: Record<string, string>,
): void {
	for (const entry of readdirSync(from)) {
		const src = join(from, entry);
		const dst = join(to, entry);
		const st = statSync(src);
		if (st.isDirectory()) {
			mkdirSync(dst, { recursive: true });
			copyWithSubstitution(src, dst, vars);
			continue;
		}
		writeFileSync(dst, substitute(readFileSync(src, "utf8"), vars));
	}
}

function substitute(input: string, vars: Record<string, string>): string {
	let out = input;
	for (const [k, v] of Object.entries(vars)) {
		out = out.replaceAll(`{{${k}}}`, v);
	}
	return out;
}

function writeChangeset(input: ScaffoldInput): void {
	const dir = join(input.root, ".changeset");
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}
	const file = join(dir, `${input.name}-initial.md`);
	writeFileSync(
		file,
		`---\n"@realistdb/${input.name}": patch\n---\n\nInitial scaffold for @realistdb/${input.name}.\n`,
	);
}

async function promptDescription(name: string): Promise<string> {
	process.stdout.write(`description for @realistdb/${name}: `);
	for await (const line of Bun.stdin
		.stream()
		.pipeThrough(new TextDecoderStream())) {
		return line.trim().split("\n")[0] ?? "";
	}
	return "";
}

if (import.meta.main) {
	const [, , rawName, rawKind] = process.argv;
	if (!rawName) {
		console.error(
			"usage: bun run scripts/new-package.ts <name> [library|config|plugin]",
		);
		process.exit(1);
	}
	const kind: Kind =
		rawKind === "config" || rawKind === "plugin" ? rawKind : "library";
	const description = await promptDescription(rawName);
	scaffoldPackage({
		root: process.cwd(),
		name: rawName,
		description,
		kind,
	});
	console.log(`✓ scaffolded @realistdb/${rawName} (${kind})`);
	console.log("  next: bun install");
}
