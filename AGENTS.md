# realistdb — Agent Instructions

You are working on `realistdb`, a TypeScript SurrealDB client published as a monorepo of packages under the `@realistdb/*` namespace. This file is the single source of truth for all agents (Claude Code, Cursor, Codex, Windsurf, Copilot, etc.). Per-agent config files are symlinks to this file.

## Project invariants

- Package manager + runtime: **Bun** only. Never `npm`, `yarn`, `pnpm`.
- `bunx` is forbidden — always `bunx --bun`.
- Task graph: Turborepo. Use `turbo run <task>` or `bun run <task>`.
- Bundler: tsdown (ESM-only, dts via oxc).
- Tests: Vitest for `packages/*`, `bun test` for `scripts/*`.
- Lint/format: Biome via Ultracite.
- Every external dep lives in a Bun catalog (`catalog:` or `catalog:<name>`).
- Every internal dep uses `workspace:*`.
- Every commit must build, typecheck, test, lint clean.

## Commit discipline

- Conventional Commits, sentence-case subject: `type(scope): Subject`.
- One logical change per commit. Split if necessary.
- All commits must be signed (SSH).
- Rebase-only merges to main. No squash, no merge commits.
- Never use `--no-verify` under any circumstances.

## Naming

- Package dirs and package names are `kebab-case`.
- Published packages: `@realistdb/<name>`.
- Internal config packages: `@realistdb/<name>-config`, placed under `packages/config/`.
- Files: `kebab-case.ts`. Exports: `camelCase`. Types/interfaces: `PascalCase`.

## Required checks before declaring work done

Run `bun run ci` and ensure it passes with zero warnings. For any `packages/*` change, a `.changeset/*.md` must exist describing the user-facing effect.

## How to add a package

```sh
bun run new:package <name> [library|config|plugin]
bun install
```

The generator copies from `scripts/templates/package/` and registers a changeset. Do not hand-scaffold packages.

## Forbidden

- `npm` / `pnpm` / `yarn` invocations.
- Bare `bunx` (must always be `bunx --bun`).
- Adding external deps outside a catalog.
- Lifecycle install scripts (`trustedDependencies` stays `[]`).
- `any`, `// @ts-ignore` (use `@ts-expect-error` + explicit reason).
- Broad `catch (e) {}` without handling.
- Deep `dist/*` imports by consumers of our packages.
- New top-level fields in published `package.json` other than `"exports"`.
