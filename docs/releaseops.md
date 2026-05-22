# ReleaseOps Policy

Deploy is blocked unless all gates pass:

- tests pass
- migrations are explicitly checked
- healthcheck is stable across consecutive probes

Rollback notes are always generated, even when a gate fails.

## Commands

- `npm run releaseops:gate`
- `npm run releaseops:gate -- --release-id=prod-2026-05-22`

## Required Inputs

- `RELEASEOPS_MIGRATIONS_CHECKED=true`
- `RELEASEOPS_HEALTHCHECK_URL=https://your-service/health`

## Optional Inputs

- `RELEASEOPS_HEALTHCHECK_SAMPLES=3` (default: `3`)
- `RELEASEOPS_HEALTHCHECK_TIMEOUT_MS=5000` (default: `5000`)
- `RELEASEOPS_TEST_COMMAND="npm test"` (default: `npm test`)
- `RELEASE_ID=prod-2026-05-22.1` (auto-generated if omitted)

## Output

Rollback note files are written to:

- `docs/releaseops/rollback-notes/<release-id>.md`

Use this file as part of release artifacts and incident response records.
