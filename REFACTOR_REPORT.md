# Refactor Report — SOTA pass

**Branch**: `chore/sota-foundation-pass`
**Completed**: 2026-04-19
**Baseline**: [`REFACTOR_BASELINE.md`](./REFACTOR_BASELINE.md)
**Plan**: [`REFACTOR_PLAN.md`](./REFACTOR_PLAN.md)

## Summary

Tightened the monorepo foundation without touching any product surface (there is none yet). Six atomic signed commits, every one green under `bun run verify`. No tooling swaps, no history rewrites, no new workflows.

## Before / after

| Metric | Before | After |
|---|---|---|
| `bun run verify` (new alias) | n/a | ✅ green |
| `bun run ci` | ✅ green | ✅ green (now an alias of `verify`) |
| `bun run fix` | n/a | ✅ exists |
| knip configuration hints | 2 | 0 |
| `turbo.json` globalDependencies | unset | 5 files covered |
| Dead `inputs` on cache-disabled tasks | 2 tasks | 0 |
| `scripts/` tests | 23 pass | 29 pass |
| Open transitive advisories (dev-only) | 1 undocumented | 1 tracked with exit condition |
| PR template | missing | added |
| Size-budget guard for publishable packages | none | `check:size-budgets` enforced in `verify` |
| Biome / lint / typecheck | clean | clean |
| `bun audit` | 1 moderate | 1 moderate (same; tracked) |

## Workstreams (all applied per plan)

1. **WS-1 — Turbo cache correctness** (`chore(turbo): Tighten cache inputs and global dependencies`)
   Added `globalDependencies: [tsconfig.base.json, biome.json, bunfig.toml, bun.lock, package.json]` so root-config changes invalidate affected task caches. Dropped dead `inputs` from `test:mutate` and `test:integration` (both `cache: false`).

2. **WS-2 — Script aliases** (`chore(scripts): Add verify and fix aliases`)
   `verify` = full local CI parity; `fix` = `biome check --write .`. `ci` retained as a thin alias for the GH Actions workflow. `AGENTS.md` and `CONTRIBUTING.md` updated.

3. **WS-3 — knip hints** (`chore(knip): Drop redundant docs entry patterns`)
   Astro auto-discovers `astro.config.mjs` and `src/content.config.ts`. Removed the redundant entries; knip now runs hint-free.

4. **WS-4 — Security advisory ledger** (`docs(security): Track transitive yaml advisory as accepted risk`)
   Added `SECURITY-ADVISORIES.md` documenting GHSA-48c2-rrv3-qjmp (`yaml <2.8.3` ReDoS), its six transitive paths, dev-only exposure, and the exit condition (upstream bumps). Cross-linked from `SECURITY.md`. Chose root location over docs site for lower coordination cost (pre-product repo; ledger is for maintainers, not end-users).

5. **WS-5 — PR template** (`chore(github): Add pull request template`)
   Minimal checklist enforcing the AGENTS.md invariants (conventional + sentence-case subject, signed commits, `bun run verify` green, catalog hygiene, changeset for `packages/*`). CODEOWNERS was already present at `.github/CODEOWNERS`; no action needed.

6. **WS-6 — Size-budget guard** (`chore(size-limit): Guard against unbudgeted publishable packages`)
   New `scripts/check-size-budgets.ts` + tests, wired into `verify`. Today a no-op (zero publishable packages); day-one of the first `@realistdb/*` library, CI will fail unless the package ships a `size-limit.config.ts` and a `check:size` script.

## Decisions worth noting

- **`ci` vs `verify`**: kept both. `ci` is the workflow entry point; `verify` is the developer-facing name (SOTA convention). Changing one-of was a bikeshed; supporting both cost nothing and avoided churn in `ci.yml`.
- **Advisory ledger at repo root, not docs site**: the docs sidebar (getting-started / guides / reference / changelog) has no security section, and adding one for a pre-product repo is premature. `SECURITY-ADVISORIES.md` sits alongside `SECURITY.md` and gets picked up by GitHub's file view.
- **`check:size-budgets` fails closed, not open**: the point of the guard is exactly to catch the "forgot to add a budget" case; a warn-only mode would defeat it.
- **No tooling swaps** (no `syncpack`, no `turbo-ignore`, no alternative changeset flow). Adding tools to a pre-product repo is anti-SOTA.

## Follow-ups for the team

Items consciously deferred; they become real once the first `@realistdb/*` library lands:

- **Bundle budgets / `publint` / `attw` enforcement**: applied per-package via the `new:package` generator, not retroactively. The WS-6 guard will prevent them from being silently missed.
- **Mutation & property-based testing**: Stryker + `fast-check` are already in the catalog; enforcement (score thresholds, CI gating) lands with the first library.
- **API-surface control (`exports` granularity, no deep imports)**: add lint rules and consumer tests when there is a public API to police.
- **Runtime validation at boundaries (zod/valibot/arktype), branded IDs, custom error classes**: decide per-package at authoring time.
- **Matrix testing (Node × Bun × OS)**: `ci.yml` already matrixes Ubuntu / macOS / Windows × Node 20/22/24; revisit once a product package exercises runtime behaviour.
- **Yaml advisory exit**: watch `bun audit` after each catalog bump; close the ledger entry when upstream lands `yaml@>=2.8.3`.
- **Docs site content**: currently 2 pages. Grows with the first shippable API.

Nothing scope-creeped. Nothing destructive. Nothing silent.

## Commit list

```
chore(size-limit):  Guard against unbudgeted publishable packages
chore(github):      Add pull request template
docs(security):     Track transitive yaml advisory as accepted risk
chore(knip):        Drop redundant docs entry patterns
chore(scripts):     Add verify and fix aliases
chore(turbo):       Tighten cache inputs and global dependencies
```

All six signed with SSH key `SHA256:lqHhCV+oGl+N835sbQHaR1WvoS1AN/2nMWEm0baca0A`.
