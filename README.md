# @narai/jira-agent-connector

Read-only Jira connector. Supports JQL search, single issue retrieval, and project metadata. Basic-auth via `JIRA_EMAIL` + `JIRA_API_TOKEN`.

## Install

```bash
npm install @narai/jira-agent-connector
```

```bash
export JIRA_SITE_URL="https://your.atlassian.net"
export JIRA_EMAIL="you@example.com"
export JIRA_API_TOKEN="…"
```

## Claude Code plugin

A ready-to-install Claude Code plugin lives at [`plugin/`](./plugin). It adds a `jira-agent` skill and a `/jira-agent <action> <params-json>` slash command, wrapping this connector. The plugin is excluded from the npm tarball via `.npmignore`; Claude Code marketplaces point directly at the `plugin/` subdirectory of this repo.

## License

MIT
