# Refactor Baseline — 2026-04-19

Snapshot of repo state before any SOTA refactor work. All metrics captured from `main` at commit `ec8d2b7` on a clean worktree.

## Repository shape

- **Nature**: public OSS library monorepo foundation. Target product = `@realistdb/*` SurrealDB client, not yet written.
- **Stage**: pre-product. Only internal config packages exist (`packages/config/{biome,size-limit,stryker,tsconfig,tsdown,vitest}`). Zero `src/` directories across packages.
- **Stack**: Bun 1.3.12 runtime + pkg manager, Turborepo 2.9.6, TypeScript 6.0.3, Biome 2.4.12 via Ultracite, tsdown 0.21.9, Vitest 4.1.4, Astro/Starlight 0.38 for docs, Changesets for release.
- **CI**: GitHub Actions — `ci.yml`, `release.yml`, `osv.yml`, `scorecard.yml`, `docs-deploy.yml`, `validate-pr.yml`, `ci-command.yml`. All actions SHA-pinned.
- **Hooks**: lefthook (pre-commit Biome + catalog check; commit-msg commitlint; pre-push affected typecheck/test/publint + signed-commit check).

## Quantitative baseline

| Metric | Value |
|---|---|
| Product packages (publishable) | 0 |
| Config packages (internal) | 6 |
| Total packages in scope | 7 (6 config + docs) |
| `bun run ci` | ✅ green (44 ms on full turbo cache hit) |
| Biome `lint` | 38 files checked, 0 errors, 0 warnings |
| `typecheck` | ✅ (via `astro check` for docs; no ts packages yet) |
| Tests (`bun test scripts/`) | 23 pass / 0 fail, 41 assertions, 6 files |
| Package-level unit tests | 0 (no source yet) |
| Coverage | n/a (no source) |
| `check:publint` / `check:attw` | n/a (no publishable package) |
| `check:size` | n/a (root config is a stub — `size-limit.config.ts` returns `[]`) |
| `check:knip` | ⚠️ 2 configuration hints (redundant entry patterns in `knip.jsonc` for docs workspace) |
| `check:catalog` | ✅ every dep is in a catalog or `workspace:*` |
| `bun audit` | ⚠️ 1 moderate — `yaml <2.8.3` ReDoS (GHSA-48c2-rrv3-qjmp). Transitive via knip, typedoc, ultracite, astro, vitest, @astrojs/check. No direct fix path; awaits upstream. |
| Bundle sizes | n/a (nothing ships yet) |
| CI wall-time (cold) | not measured — TODO once a product pkg lands |
| Secrets in history | none (gitleaks check in Scorecard workflow) |

## Foundation already in place (SOTA-ish)

- TypeScript: `strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` + `noImplicitOverride` + `noFallthroughCasesInSwitch` + `noPropertyAccessFromIndexSignature` + `isolatedDeclarations` + `verbatimModuleSyntax`.
- Conventional Commits + sentence-case subject enforced by commitlint.
- Signed-commit enforcement via lefthook + CI script.
- Every external dep resolved through Bun catalogs; `check:catalog` guards drift.
- `trustedDependencies: []`, `bunfig.toml: ignoreScripts = true`.
- GitHub Actions SHA-pinned, OpenSSF Scorecard + OSV scanner workflows present.
- Rebase-only merges, branch protection presumed (not verifiable from local checkout).
- Per-agent config files symlinked to a single `AGENTS.md`.
- README / LICENSE (MIT) / SECURITY.md / CODE_OF_CONDUCT.md / CONTRIBUTING.md present.

## Gaps observed

1. **knip configuration hints** — two "redundant entry pattern" warnings against `docs/knip.jsonc`.
2. **`turbo.json` misses `globalDependencies`** — root config changes (tsconfig.base, biome.json, bunfig, bun.lock) don't bust the task cache.
3. **Root npm scripts lack `verify` / `check` / `fix` aliases** — the SOTA convention (and the task's own rubric) expects a single `bun run verify` that mirrors CI and a `bun run fix` for autofixes. Today only `ci` exists.
4. **`size-limit.config.ts` is a `[]` stub** — acceptable pre-product, but should fail loudly once first package ships rather than silently pass.
5. **`test:integration` task cache disabled but `inputs` still declared** — minor drift, no effect.
6. **Transitive `yaml` moderate CVE** undocumented — no `SECURITY-ADVISORIES.md` tracking accepted-risk advisories.
7. **Docs site has 2 pages** — acceptable stub, but `astro check` required adding `typescript` prompt during cold-build (currently satisfied by cache).
8. **No `CODEOWNERS` at repo root** (memory indicates it was configured earlier; needs verification on `main`).
9. **No `PR template`** visible under `.github/`.
10. **No `verify` script for agents** despite AGENTS.md being the single-source agent instruction file.

## Deferred-until-product work

Most of the SOTA rubric — API-surface control, `exports` field granularity, tree-shaking verification, `publint`/`attw` results, size budgets, mutation testing, threat model, RLS, observability, UI/UX — is **not applicable yet**. These will become real work once the first `@realistdb/*` library package is scaffolded (via `bun run new:package`).

## Baseline capture commands (for reproducibility)

```sh
bun run ci
bun audit
bun run check:knip
bun test scripts/
git log --oneline -20
```
