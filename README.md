# Notes DevOps Testing Pipeline Demo

Monorepo used for a live presentation on testing in DevOps environments. It contains a small notes CRUD app with a Rust/Axum/SQLite backend, a React/Vite frontend, Turborepo orchestration, a Nix development shell, and parallel GitHub Actions checks.

## Requirements

- Nix with flakes enabled
- `direnv` is optional, but supported through `.envrc`

Enter the pinned development environment:

```bash
nix develop
```

Install JavaScript dependencies:

```bash
pnpm install
```

## Common Commands

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Run the backend and frontend during development:

```bash
pnpm --filter backend dev
pnpm --filter frontend dev
```

The frontend development server proxies `/api` to the backend on `http://localhost:3000`.

## CI

The GitHub Actions workflow runs independent backend and frontend jobs for format, lint, typecheck, and tests. The separate jobs are intentional so demo PRs clearly show which part of the stack failed.

## Demo Branches

See [plan.md](./plan.md) for the branch-by-branch demo script and the intentional failure changes.
