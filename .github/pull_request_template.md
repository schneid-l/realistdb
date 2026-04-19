<!--
Thanks for contributing! A few things to confirm before you submit.
-->

## Summary

<!-- What changed and why. One paragraph. Link issues with "Fixes #123". -->

## Checklist

- [ ] Subject line is Conventional Commits + sentence-case (`type(scope): Subject`).
- [ ] All commits are signed (SSH).
- [ ] `bun run verify` passes locally with zero warnings.
- [ ] Every external dep lives in a Bun catalog; every internal dep uses `workspace:*`.
- [ ] For any `packages/*` change, a `.changeset/*.md` describes the user-facing effect.
- [ ] No `--no-verify`, no `any`, no `@ts-ignore`, no bare `bunx`.

## Test plan

<!-- How you verified this. Commands run, manual checks, edge cases considered. -->

## Notes for reviewers

<!-- Non-obvious decisions, rollback notes, follow-ups. Delete if none. -->
