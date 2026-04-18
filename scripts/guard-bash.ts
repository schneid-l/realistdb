export type GuardResult = { allow: true } | { allow: false; reason: string };

const BLOCKED_BINARIES: readonly string[] = ["npm", "pnpm", "yarn"];
const CONVENTIONAL_RE =
  /^(feat|fix|chore|docs|refactor|perf|test|build|ci|revert|style)(\([\w\-/]+\))?!?:\s+/;
const NO_VERIFY_RE = /--no-verify\b/;
const BUNX_RE = /\bbunx\b/;
const BUNX_BUN_RE = /\bbunx\s+--bun\b/;
// Captures the -m argument value for single-line commit messages (rejects
// messages that start with $, which indicates a HEREDOC or subshell body).
const SINGLE_LINE_COMMIT_RE =
  /\bgit\s+commit\s+(?:[^$]|$)*?-m\s+["']([^"'$][^"']*)["']/;

export function guardBash(input: { command: string }): GuardResult {
  const cmd = input.command.trim();

  if (NO_VERIFY_RE.test(cmd)) {
    return { allow: false, reason: "--no-verify is forbidden" };
  }

  for (const bin of BLOCKED_BINARIES) {
    const re = new RegExp(String.raw`(^|\s|&&\s*|;\s*|\|\s*|\$\(\s*)${bin}\b`);
    if (re.test(cmd)) {
      return { allow: false, reason: `'${bin}' is forbidden; use bun` };
    }
  }

  if (BUNX_RE.test(cmd) && !BUNX_BUN_RE.test(cmd)) {
    return {
      allow: false,
      reason: "bunx must be invoked as 'bunx --bun' to force the bun runtime",
    };
  }

  const singleLine = cmd.match(SINGLE_LINE_COMMIT_RE);
  if (singleLine) {
    const msg = singleLine[1] ?? "";
    if (!CONVENTIONAL_RE.test(msg)) {
      return {
        allow: false,
        reason: `commit message must start with conventional commits prefix: got "${msg}"`,
      };
    }
  }

  return { allow: true };
}

interface HookInput {
  tool_input?: { command?: string };
}

if (import.meta.main) {
  const raw = await Bun.stdin.text();
  const parsed = raw.trim() ? (JSON.parse(raw) as HookInput) : {};
  const command = parsed.tool_input?.command ?? "";
  const result = guardBash({ command });
  if (result.allow) {
    process.exit(0);
  }
  console.error(`[guard-bash] BLOCKED: ${result.reason}`);
  console.error(`  command: ${command}`);
  // Claude Code hook convention: exit 2 blocks the tool call.
  process.exit(2);
}
