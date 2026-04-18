# realistdb

> A realistic SurrealDB client for TypeScript.

[![CI](https://img.shields.io/github/actions/workflow/status/schneid-l/realistdb/ci.yml?branch=main)](https://github.com/schneid-l/realistdb/actions/workflows/ci.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/schneid-l/realistdb/badge)](https://scorecard.dev/viewer/?uri=github.com/schneid-l/realistdb)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

realistdb is a TypeScript monorepo providing:

- A query builder that speaks the full SurrealDB query language, with optimization and strong types.
- An ORM that accepts schemas from Zod, ArkType, plain TypeScript, JS objects, or YAML via a plugin system.
- Transport plugins (WebSocket, HTTP, GraphQL, SurrealDB official JS client).
- Codegen plugins.

Status: **early development.** The foundation is in place; packages are being built out.

## Docs

[schneid-l.github.io/realistdb](https://schneid-l.github.io/realistdb) (published once the first package ships).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

See [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE).
