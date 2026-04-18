# Contributing to realistdb

## Setup

```sh
bun install
bun run setup        # installs lefthook hooks
```

## Git configuration (required)

Signed commits are mandatory. Configure SSH signing once:

```sh
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true
git config --global tag.gpgsign true
```

Upload your public key to GitHub → Settings → SSH and GPG keys → "Signing Key".

## Workflow

1. Branch from `main`: `git checkout -b feat/<short-name>`.
2. Make atomic commits — each must build, typecheck, test, lint clean. Conventional Commits, sentence-case subject.
3. For any `packages/*` change: `bun run changeset` and commit the generated file.
4. `git push`.
5. Open a PR. Only `validate-pr` runs by default — zero CI minutes burned until you opt in.
6. When ready for full CI: add the `ci` label or comment `/ci`.
7. After approval, PR goes through the merge queue (which runs full CI again). Merge strategy is **rebase-only**.

## Forbidden

- `npm`, `pnpm`, `yarn` — we use `bun` exclusively.
- Bare `bunx` — always `bunx --bun`.
- `--no-verify` on any git operation.
- Adding deps outside catalogs.

## Adding a package

```sh
bun run new:package <name> [library|config|plugin]
bun install
```

The generator copies from `scripts/templates/package/` and registers a changeset.

## Running CI locally

```sh
bun run ci
```

## Testing

- Unit + property + type tests are mandatory for public API.
- Integration tests via Testcontainers against a real SurrealDB image: `bun run test:integration`.
- Mutation testing: `bun run test:mutate`. Score must be ≥ 80% before 1.0.

## Reporting issues

- Bugs: [GitHub Issues](https://github.com/schneid-l/realistdb/issues).
- Security: private via GitHub Security Advisories. See [SECURITY.md](SECURITY.md).
