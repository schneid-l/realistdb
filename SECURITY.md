# Security Policy

## Reporting a vulnerability

Report security issues privately via GitHub [Security Advisories](https://github.com/schneid-l/realistdb/security/advisories/new). Do not open a public issue.

We aim to respond within 48 hours and publish a fix within 14 days for critical issues.

## Supported versions

Only the latest minor version of each supported major receives security fixes. See the [releases page](https://github.com/schneid-l/realistdb/releases).

## Supply chain

- Direct deps are pinned exactly, managed via Bun catalogs.
- No install-time lifecycle scripts run (`trustedDependencies: []`, `ignoreScripts = true`).
- Published packages carry sigstore provenance (npm).
- GitHub Actions are pinned by commit SHA, rotated by Dependabot.
- Every commit is signed; `validate-pr.yml` enforces this via GitHub's verification API.
