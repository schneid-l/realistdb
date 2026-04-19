# Security advisories ledger

This file tracks known advisories affecting realistdb's dependency tree, with
our risk assessment and exit conditions. Only **accepted-risk** items live
here. Actionable items are fixed and removed.

Scope: advisories surfaced by `bun audit` and `osv-scanner` (see
`.github/workflows/osv.yml`).

## Open

### GHSA-48c2-rrv3-qjmp — `yaml <2.8.3` ReDoS (moderate)

- **Package**: `yaml`
- **Affected range**: `>=2.0.0 <2.8.3`
- **Advisory**: https://github.com/advisories/GHSA-48c2-rrv3-qjmp
- **Paths (transitive, dev-only)**:
  - `knip › yaml`
  - `ultracite › yaml`
  - `@realistdb/docs › astro › yaml`
  - `@realistdb/docs › @astrojs/check › yaml`
  - `@realistdb/docs › typedoc › yaml`
  - `@realistdb/vitest-config › vitest › yaml`
- **Exposure**: none at runtime. `yaml` is never loaded by any code we ship;
  every path is a build- or tooling-time dependency, invoked only on
  developer machines and in CI, on YAML we author ourselves (never on
  attacker-controlled input).
- **Decision**: accept. Waiting on upstream bumps to `yaml@>=2.8.3`.
- **Exit condition**: `bun audit` reports zero advisories. Remove this entry.
- **Last reviewed**: 2026-04-19.

## Closed

_(empty)_

---

## How to use this file

- When `bun audit` flags a new advisory, triage it:
  - If a direct fix is available (catalog bump, override), apply it and do
    **not** add an entry here.
  - If the advisory is transitive and not yet fixed upstream, assess
    runtime vs. tooling exposure. If exposure is tolerable, add an entry
    under **Open** with the fields above.
- On every dependency bump touching a flagged tree, re-verify the entry and
  update `Last reviewed`.
- When the upstream fix lands, move the entry to **Closed** with the PR
  number that resolved it.
