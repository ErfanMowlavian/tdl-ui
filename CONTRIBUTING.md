# Contributing to tdl-ui

Thanks for your interest! This guide covers how to set up, develop, and submit changes.

## Setup

**Requirements:** Node.js 22+ (for the built-in `node:sqlite`) and pnpm 9+.

```bash
pnpm install
TDL_MODE=mock pnpm dev   # run the full app with no tdl binary or Telegram account
```

Mock mode is the easiest way to develop — it simulates `tdl`, so you don't need a binary or account. Real mode (`pnpm dev`) requires [`tdl`](https://github.com/iyear/tdl) on your `PATH`.

## Before you push

Run the full check suite (the same one CI runs):

```bash
pnpm verify   # format:check + lint + typecheck + test + build
```

Useful during development:

```bash
pnpm format                                # auto-fix formatting
pnpm test                                  # run all tests
pnpm exec vitest run src/lib/x/y.test.ts   # run a single test file
```

## Architecture in brief

- **All access to `tdl` goes through the adapter** in `src/lib/tdl/`. Never call `child_process` or spawn `tdl` directly from feature code.
- When you add a new `tdl` operation, also **teach the mock adapter** (`src/lib/tdl/mock-adapter.ts`) to simulate it — otherwise it breaks in mock mode and CI.
- Long-running actions are **jobs**: create them via `JobManager.create(...)` (`src/lib/jobs/manager.ts`); they stream to the browser over SSE.
- Persistence uses the built-in `node:sqlite`. Repositories accept a database instance so tests can use an in-memory one (`createMemoryDb()`).

## Conventions

- **Validate all user input with [Zod](https://zod.dev/)**, and always pass `tdl` arguments as an **array of strings** (never a shell string). The server builds argument arrays from validated fields — never accept raw arguments from the client.
- **shadcn/ui here is built on Base UI**, not Radix. Compose with the `render` prop, not `asChild`: `<Button render={<Link href="/x" />}>Label</Button>`.
- Do not call `setState` synchronously reachable from `useEffect`. Load initial data in a server component and pass it as a prop; only `setState` from event handlers.
- Don't edit generated files in `src/components/ui/**`. Add shadcn components with `pnpm dlx shadcn@latest add <name> -y -o`.

## Commits & pull requests

- Use [Conventional Commits](https://www.conventionalcommits.org/): `feat(scope): ...`, `fix: ...`, `docs: ...`, `chore: ...`, `test: ...`.
- Keep changes focused; one logical change per PR.
- Make sure `pnpm verify` is green before opening a PR. CI must pass before merge.

## Reporting issues

Use the issue templates. Include steps to reproduce, what you expected, and whether you were in `mock` or `real` mode.
