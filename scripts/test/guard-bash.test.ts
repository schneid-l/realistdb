import { describe, expect, test } from "bun:test";
import { guardBash } from "../guard-bash.ts";

describe("guardBash", () => {
	test("allows bun, git, ls, and bunx --bun", () => {
		expect(guardBash({ command: "bun install" }).allow).toBe(true);
		expect(guardBash({ command: "git status" }).allow).toBe(true);
		expect(guardBash({ command: "ls -la" }).allow).toBe(true);
		expect(guardBash({ command: "bunx --bun biome check ." }).allow).toBe(true);
	});

	test("blocks npm, pnpm, yarn", () => {
		expect(guardBash({ command: "npm install foo" }).allow).toBe(false);
		expect(guardBash({ command: "pnpm add bar" }).allow).toBe(false);
		expect(guardBash({ command: "yarn install" }).allow).toBe(false);
	});

	test("blocks bare bunx (must be bunx --bun)", () => {
		const r = guardBash({ command: "bunx biome check ." });
		expect(r.allow).toBe(false);
		if (!r.allow) {
			expect(r.reason).toContain("bunx --bun");
		}
	});

	test("blocks single-line non-conventional commit messages", () => {
		expect(guardBash({ command: 'git commit -m "fix stuff"' }).allow).toBe(
			false,
		);
		expect(
			guardBash({ command: 'git commit -m "feat(x): add stuff"' }).allow,
		).toBe(true);
		expect(guardBash({ command: 'git commit -m "chore: bump"' }).allow).toBe(
			true,
		);
	});

	test("allows git commit with HEREDOC body", () => {
		const cmd = `git commit -m "$(cat <<'EOF'
feat(x): thing

body
EOF
)"`;
		expect(guardBash({ command: cmd }).allow).toBe(true);
	});

	test("blocks --no-verify", () => {
		expect(
			guardBash({ command: "git commit --no-verify -m 'feat: x'" }).allow,
		).toBe(false);
		expect(guardBash({ command: "git push --no-verify" }).allow).toBe(false);
	});
});
