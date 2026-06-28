<div align="center">

# tdl-ui

**A clean, local web UI for [`tdl`](https://github.com/iyear/tdl) — the Telegram downloader toolkit.**

Drive `tdl` from your browser instead of the terminal: log in, browse chats, download, upload, and forward — all with live progress, running entirely on your own machine.

[![CI](https://github.com/ErfanMowlavian/tdl-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/ErfanMowlavian/tdl-ui/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

</div>

---

## Overview

`tdl` is a fast, powerful command-line Telegram toolkit. `tdl-ui` puts a friendly interface on top of it. It runs as a **local web app**: a Next.js server on your own machine spawns the `tdl` binary, parses its output, and streams live progress to your browser over Server-Sent Events. Nothing is hosted remotely — your sessions and downloads never leave your computer.

## Features

- 🔐 **Login & sessions** — QR login and Telegram Desktop import, with multiple session namespaces
- ⬇️ **Download** — from message links, with output dir, threads, parallel tasks, and extension filters
- 💬 **Browse & export** — list a session's chats and export a chat's messages to JSON
- ⬆️ **Upload** — send local files to a chat
- ↪️ **Forward** — route messages from one chat to another
- 📊 **Live jobs** — every long-running action is a job with real-time progress, cancel, and history (local SQLite)
- 🧪 **Mock mode** — run the entire app with no `tdl` binary and no Telegram account (great for trying it out and for CI)

## Quick start

**Requirements:** [Node.js](https://nodejs.org/) 22+ (for the built-in `node:sqlite`) and [pnpm](https://pnpm.io/) 9+.

Try it instantly in **mock mode** — no `tdl` binary or Telegram account needed:

```bash
pnpm install
TDL_MODE=mock pnpm dev   # http://localhost:3000
```

For real use, install [`tdl`](https://github.com/iyear/tdl) and make sure it's on your `PATH`, then:

```bash
pnpm install
pnpm dev                 # http://localhost:3000
```

Open the app, connect a session under **Login**, and start downloading.

## Screenshots

<!-- Add screenshots/GIFs here, e.g. under docs/ :
![Dashboard](docs/dashboard.png)
![Download](docs/download.png)
-->

_Run `TDL_MODE=mock pnpm dev` to explore the full UI._

## How it works

The whole app talks to `tdl` through a single boundary, the **tdl adapter** (`src/lib/tdl/`). Feature code never touches `child_process` directly; it goes through the adapter, which has two interchangeable implementations selected by `TDL_MODE`:

- **real** — spawns the `tdl` binary and parses its terminal output;
- **mock** — simulates `tdl` so everything runs with no binary or account.

Long-running work (downloads, uploads, forwards, exports) is modelled as **jobs**. A `JobManager` runs them through the adapter, persists them in a local SQLite database (the built-in `node:sqlite`), and broadcasts lifecycle events that the browser consumes over Server-Sent Events for live progress.

**Tech stack:** Next.js (App Router) · TypeScript · Tailwind CSS · shadcn/ui · `node:sqlite` · Server-Sent Events · Zod · Vitest · pnpm.

## Development

```bash
pnpm dev          # dev server at http://localhost:3000
pnpm build        # production build
pnpm start        # serve the production build
pnpm lint         # eslint
pnpm typecheck    # tsc --noEmit
pnpm test         # vitest
pnpm verify       # all of the above (format, lint, typecheck, test, build)
pnpm format       # prettier --write .
```

`pnpm verify` runs the exact checks CI runs — use it before pushing. See [CONTRIBUTING.md](./CONTRIBUTING.md) for conventions.

## Configuration

Configuration comes from environment variables; copy `.env.example` to `.env.local` to override defaults:

| Variable           | Default      | Purpose                                                |
| ------------------ | ------------ | ------------------------------------------------------ |
| `TDL_MODE`         | `real`       | `real` spawns `tdl`; `mock` simulates it (no binary)   |
| `TDL_BIN`          | `tdl`        | Name or path of the `tdl` binary                       |
| `TDL_DATA_DIR`     | `data/`      | Where the local SQLite database is stored (gitignored) |
| `TDL_DOWNLOAD_DIR` | `downloads/` | Default download directory                             |

## Disclaimer

`tdl-ui` is an unofficial, independent project and is not affiliated with Telegram or the `tdl` project. You are responsible for using it in compliance with [Telegram's Terms of Service](https://telegram.org/tos). It requires a separately installed [`tdl`](https://github.com/iyear/tdl) binary.

## License

[MIT](./LICENSE) © Erfan Mowlavian
