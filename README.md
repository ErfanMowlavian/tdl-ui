<div align="center">

# tdl-ui

**A clean, local web UI for [`tdl`](https://github.com/iyear/tdl) — the Telegram downloader toolkit.**

Drive `tdl` from your browser instead of the terminal: log in, browse chats, queue downloads, upload, and forward — all with live progress, running entirely on your own machine.

</div>

---

> [!NOTE]
> **Work in progress.** This repository is being built in public, feature by feature. See the [open pull requests](../../pulls) to follow along.

## Overview

`tdl` is a fast, powerful command-line Telegram toolkit. `tdl-ui` puts a friendly interface on top of it. It runs as a **local web app**: a Next.js server on your machine spawns the `tdl` binary, parses its output, and streams live progress to your browser. Nothing is hosted remotely — your sessions and downloads never leave your computer.

## Planned features

- 🔐 **Login & sessions** — desktop session import and QR login, with multiple session namespaces
- ⬇️ **Download** — from message links or whole chats, with threads, filters, and live progress
- 💬 **Browse & export** — list chats and export message metadata to JSON, then download from it
- ⬆️ **Upload & forward** — send local files to Telegram and route messages between chats
- 📊 **History & queue** — a local SQLite-backed dashboard of past and active jobs

## Tech stack

Next.js (App Router) · TypeScript · Tailwind CSS · shadcn/ui · SQLite (built-in `node:sqlite`) · Server-Sent Events · Vitest · pnpm

## Status

| Phase | Feature                 | Status     |
| ----- | ----------------------- | ---------- |
| 1     | Scaffold & app shell    | ✅ Done    |
| 2     | tdl adapter + mock mode | ✅ Done    |
| 3     | Login & sessions        | ⏳ Planned |
| 4     | Download                | ⏳ Planned |
| 5     | Browse & export chats   | ⏳ Planned |
| 6     | Upload & forward        | ⏳ Planned |

## Development

**Requirements:** [Node.js](https://nodejs.org/) 22+ (for the built-in `node:sqlite`) and [pnpm](https://pnpm.io/) 9+.

```bash
pnpm install      # install dependencies
pnpm dev          # start the dev server at http://localhost:3000
```

Other scripts:

```bash
pnpm build        # production build
pnpm start        # serve the production build
pnpm lint         # eslint
pnpm typecheck    # tsc --noEmit
pnpm test         # vitest
pnpm format       # prettier --write .
```

## Configuration

Configuration is read from environment variables; copy `.env.example` to
`.env.local` to override defaults. The most useful one is the adapter mode:

- **`TDL_MODE=real`** (default) — spawn the actual `tdl` binary. Connecting a
  real Telegram session requires [`tdl`](https://github.com/iyear/tdl) on your
  `PATH`.
- **`TDL_MODE=mock`** — simulate tdl with no binary and no Telegram account.
  The whole UI works end-to-end, which is how CI runs and the quickest way to
  try the app:

  ```bash
  TDL_MODE=mock pnpm dev
  ```

Other variables (`TDL_BIN`, `TDL_DATA_DIR`, `TDL_DOWNLOAD_DIR`) are documented
in `.env.example`.

## Disclaimer

`tdl-ui` is an unofficial, independent project and is not affiliated with Telegram or the `tdl` project. You are responsible for using it in compliance with [Telegram's Terms of Service](https://telegram.org/tos). It requires a separately installed [`tdl`](https://github.com/iyear/tdl) binary.

## License

[MIT](./LICENSE) © Erfan Mowlavian
