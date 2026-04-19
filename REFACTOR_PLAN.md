# Refactor Plan — SOTA pass for `realistdb`

**Status**: Phase 1 (Discovery) complete. **Awaiting approval before Phase 2.**

Produced autonomously by the `sota` scheduled task on 2026-04-19. Baseline captured in [`REFACTOR_BASELINE.md`](./REFACTOR_BASELINE.md).

---

## 1 · Context assessment

- **Nature**: public OSS TypeScript library monorepo, MIT-licensed, published under `@realistdb/*`. Target product = SurrealDB client. Not yet written.
- **Audience**: external developers who will depend on our published packages. No end-user UI, no backend service, no database of our own, no PII.
- **Maturity**: greenfield foundation. The scaffolding is live on `main`; the first product package has not been generated.
- **Scale**: solo maintainer, expected community contributors once public. No team, no SLOs, no on-call, no production traffic.
- **Risk profile**: supply-chain risk (published to npm → downstream apps) dominates. No runtime security/privacy surface of our own.

This framing drives **every** scope decision below. We are a *pre-product library monorepo*; we are not a SaaS.

## 2 · Scope decisions

### In scope (applies now)

| # | Category | Why it applies pre-product |
|---|---|---|
| 1 | **Turbo cache correctness** — add `globalDependencies`, prune dead inputs | Cheap, catches drift now instead of after 50 commits |
| 2 | **Script consistency** — add `verify` / `fix` aliases alongside `ci`, `format` | SOTA rubric + agent-driven dev both depend on these |
| 3 | **knip hint cleanup** — remove redundant `docs` entry patterns | Zero-cost hygiene |
| 4 | **Transitive advisory tracking** — document the `yaml` moderate CVE as an accepted-risk advisory | Supply-chain posture for a public lib |
| 5 | **`CODEOWNERS` + `.github/pull_request_template.md`** verification / creation | Public-repo basics |
| 6 | **`size-limit` stub hardening** — make it fail loudly if zero budgets detected *once a publishable package exists* (keep passing until then via an explicit gate) | Prevents silent regression when the first pkg ships |
| 7 | **Bun audit wired into CI** (or confirmed) + advisory ledger | Supply-chain posture |
| 8 | **`AGENTS.md` tightening** — confirm it stays minimal, cross-link to `verify`/`fix` scripts | Already mostly good |
| 9 | **README refresh** — once `verify`/`fix` land, quickstart should reference them | Keeps docs honest |

### Deliberately skipped (doesn't apply yet)

With one-line justification for each, so the skip is conscious, not silent.

- **Bundle budgets per package / tree-shake verification / `publint` / `attw` results** — no publishable package yet; will be built into the `new:package` generator rather than applied retroactively.
- **Mutation testing, property-based testing, contract tests, coverage gates** — nothing to mutate or cover. Config for Stryker + Vitest already exists; enforcement waits for first package.
- **API-surface control, barrel-file audit, `exports` field granularity** — premature.
- **Runtime validation libraries (zod/valibot), branded types, error classes** — no runtime code.
- **Database concerns (migrations, RLS, N+1, indexes)** — we are a client for SurrealDB, not an owner of one.
- **UI / UX / i18n / a11y / Web Vitals** — no UI. Docs site is a minimal Starlight stub (2 pages).
- **Observability, SLOs, alerting, incident runbooks, rollback strategy** — no service to observe.
- **Privacy / retention / consent / right-to-erasure** — no data collected.
- **Multi-region, preview deployments, matrix builds** — no deployable app; matrix Node/Bun testing arrives with the first package.
- **Mutation / visual regression / accessibility test harnesses** — nothing to test.
- **`.agentignore` / generated-file exclusions** — nothing generated of appreciable size.
- **Threat model / SBOM / provenance attestation** — defer to the release of the first published package; provenance is a publish-time concern.

### Explicitly out of scope for this pass

- Any scaffolding of a product package (`@realistdb/core` etc.). That belongs in a feature task, not a SOTA sweep.
- Rewriting the git history on `main`. Foundation history was already rewritten recently; further churn is not worth the coordination cost.
- Adopting any new tool (e.g. `syncpack`, `turbo-ignore`, `changesets/action` alternatives). The existing toolchain is already coherent; adding more is anti-SOTA.

## 3 · Workstreams

Each workstream is sized to **one atomic commit** unless noted. All commits sentence-case conventional, signed, pass `bun run ci`.

### WS-1 — Turbo cache correctness *(blocking: none)*

**Goal**: root config changes invalidate affected tasks.
- Add `globalDependencies: ["tsconfig.base.json", "biome.json", "bunfig.toml", "bun.lock", "package.json"]` to `turbo.json`.
- Drop unused `inputs` from `test:integration` (`cache: false` makes them dead).
- Verify cache behaviour with `turbo run build --dry=json` before/after.

**Risks**: over-invalidation if globals are too broad → start conservative. Reversible.

**Expected commits**: 1 (`chore(turbo): Tighten cache inputs and global dependencies`).

### WS-2 — Script aliases *(blocking: none, parallelizable with WS-1)*

**Goal**: one-command local parity with CI; one-command autofix.
- Add root scripts:
  - `"verify": "bun run ci"` (explicit alias; `ci` stays for GH-Actions naming).
  - `"fix": "biome check --write . && biome format --write ."`.
  - `"check": "turbo run build typecheck test check:publint check:attw check:size"`.
- Update `AGENTS.md` "Required checks" to reference `bun run verify`.
- Update `README.md` quickstart.

**Risks**: naming bikeshed. Chosen because `verify` is industry-standard for "full local check" and `fix` is the natural counterpart.

**Expected commits**: 1 (`chore(scripts): Add verify/fix/check aliases`).

### WS-3 — knip hint cleanup *(blocking: none)*

**Goal**: `bun run check:knip` emits zero hints.
- Remove the two redundant entry patterns in `knip.jsonc` for the `docs` workspace (Astro auto-discovers `astro.config.mjs` and `src/content.config.ts`).
- Re-run `check:knip` to confirm clean output.

**Expected commits**: 1 (`chore(knip): Drop redundant docs entry patterns`).

### WS-4 — Supply-chain posture *(blocking: none)*

**Goal**: transitive advisories are tracked, not ignored.
- Add `docs/src/content/docs/security/advisories.md` (or `SECURITY-ADVISORIES.md` at root) documenting the open `yaml <2.8.3` moderate CVE, its transitive paths, why we accept it (dev-only, no runtime exposure), and the exit condition (upstream bumps).
- Confirm `osv.yml` runs on PR + schedule (already does per inventory).
- Optional: add `bun audit --prod` as a non-blocking CI step once we have a product package; skip now (no `--prod` deps yet).

**Expected commits**: 1 (`docs(security): Track transitive yaml advisory as accepted risk`).

### WS-5 — Repo hygiene *(blocking: none)*

**Goal**: public-repo basics verified and present.
- Verify `CODEOWNERS` on `main` (memory says configured; confirm file lives at `.github/CODEOWNERS`). If missing, restore.
- Add `.github/pull_request_template.md` with a minimal checklist (changeset?, tests?, docs?, conventional-commit subject?).
- Verify `renovate.json` / dependabot config aligned with catalog grouping; current workflow shows Dependabot updated codeql-action — means dependabot is live. Confirm grouping config.

**Expected commits**: up to 2 (`chore(github): Add pull-request template`, `chore(github): Restore CODEOWNERS` — skip if already present).

### WS-6 — Size-limit future-proofing *(blocking: WS-2)*

**Goal**: stub config cannot silently continue to pass once a product package exists.
- Replace the `[]` stub in `size-limit.config.ts` with a programmatic scan: if any workspace under `packages/*` (excluding `packages/config/*`) has a `dist/` but no entry in the composed config, fail with a clear error.
- Today: still passes (no publishable packages). Day-one of first package: forces explicit budget declaration.

**Risks**: false positives if someone adds a publishable package without a `size-limit.config.ts`. That's the intent.

**Expected commits**: 1 (`chore(size-limit): Fail on unbudgeted publishable packages`).

## 4 · Sequencing

```
WS-1 ──┐
WS-2 ──┤
WS-3 ──┼── (all independent, run in parallel via worktrees)
WS-4 ──┤
WS-5 ──┘
                    │
                    ▼
                   WS-6 (depends on WS-2: uses `bun run verify`)
```

Target: 6–8 atomic commits total, single PR stack or single branch depending on reviewer preference. **Every commit green under `bun run ci`.**

## 5 · Open questions (need human input before Phase 2)

1. **Repo maintainer preference on commit stack vs. single PR.** Default: single branch, one PR, 6–8 commits.
2. **Is there deliberate reason `ci` is not called `verify`?** If it's to match a GH Actions workflow name (`ci.yml`), we keep both (`ci` as alias of `verify`). Confirm.
3. **WS-6 risk tolerance**: fail-closed (CI error) vs. fail-open (warn) on unbudgeted publishable packages? Default proposal = fail-closed.
4. **Advisory ledger location**: `docs/src/content/docs/security/advisories.md` (public, discoverable) or root `SECURITY-ADVISORIES.md` (closer to maintainers)? Default = docs site, since this is a public library.
5. **Should we introduce `syncpack` or similar version-parity tool on top of catalogs?** Default: no — catalogs + `check:catalog` already cover it.

## 6 · Out of scope (restated for safety)

- No source-code authoring (no `src/` added in any package).
- No history rewrites of `main`.
- No tooling swaps.
- No new workflows beyond what the workstreams demand (none do).
- No destructive git operations. No `--no-verify`. No force-pushes.

## 7 · Deliverables at end of Phase 2

- `REFACTOR_BASELINE.md` (this Phase 1 artefact — untouched).
- `REFACTOR_PLAN.md` (annotated with ✅/✏️ as workstreams land).
- `REFACTOR_REPORT.md` (before/after, decisions, follow-ups).
- 6–8 atomic signed commits on a single feature branch.
- Clean `bun run ci` at every commit.

---

**Stopping here per task instructions. Awaiting approval or scope adjustments before starting Phase 2.**
