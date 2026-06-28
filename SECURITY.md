# Security

## Scope

`tdl-ui` is a **local** application: it runs on your own machine and is intended to be reached only from `localhost`. It is not designed to be exposed to the public internet. Do not run it on a shared or untrusted host, or behind a public reverse proxy, without adding your own authentication and hardening.

Your Telegram session data is managed by `tdl` and stored locally; the app's own database (job history, tracked session namespaces) lives under `TDL_DATA_DIR` (default `data/`, gitignored).

## Reporting a vulnerability

If you find a security issue, please **do not open a public issue**. Instead, report it privately via [GitHub Security Advisories](https://github.com/ErfanMowlavian/tdl-ui/security/advisories/new). Include steps to reproduce and the potential impact. You'll get a response as soon as possible.
