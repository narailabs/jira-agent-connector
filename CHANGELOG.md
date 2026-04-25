# Changelog

## 3.2.0 — 2026-04-25

### Added
- `@narai/connector-config@^1.1.0` dep + a CLI bootstrap that loads the Jira slice from `~/.connectors/config.yaml` (or `NARAI_CONFIG_BLOB` when injected by `@narai/connector-hub`) and applies its options to `process.env` before `connector.main` runs. Existing `JIRA_*` env exports take precedence — the bootstrap only fills in undefined entries. Mapping: `site_url → JIRA_SITE_URL`, `email → JIRA_EMAIL`, `api_token → JIRA_API_TOKEN`.

## 3.1.0 — 2026-04-23

### Added
- Usage tracking via `@narai/connector-toolkit@^3.1.0`. Installs three plugin hooks (`PostToolUse`, `SessionEnd`, `SessionStart` stale-check) that record per-call response bytes and estimated tokens to `.claude/connectors/jira/usage/<session>.jsonl` and summarize at session end.

### Changed
- `@narai/connector-toolkit` dep bumped from `^3.0.0-rc.1` to `^3.1.0`.

## 3.0.0 — 2026-04-22

### BREAKING

- Requires `@narai/connector-toolkit@^3.0.0-rc.1`. See toolkit 3.0 changelog for `Decision`, `ExtendedEnvelope`, and `HardshipEntry` breaking changes (most do not affect this connector; documented for downstream awareness).

### Added

- `scope(ctx)` callback opts this connector into toolkit 3.0's tenant-scoped self-improvement loop. Keys patterns.yaml/hardships.jsonl storage by `siteUrl` (e.g. `https://acme.atlassian.net`). (See toolkit design doc at `connector-toolkit/docs/plans/2026-04-22-self-improvement-loop-design.md`.)

## 2.1.0 — 2026-04-21

### Added

- `list_attachments(issue_key)` — list attachments on an issue (read from `fields.attachment`).
- `get_attachment(issue_key, attachment_id)` — download an attachment, sha256-checksum, extract PDF/DOCX/PPTX/text via the toolkit's extractors.
- `get_comments(issue_key, max_results?)` — list comments with ADF→plain body conversion.
- Client methods: `listAttachments`, `getAttachmentDownload`, `getComments`, plus `siteUrl` getter.
- Internal `src/lib/adf.ts` — ADF (Atlassian Document Format) → plain-text walker used by `getComments` and reusable for issue descriptions.

### Changed

- Dependency bump: `@narai/connector-toolkit` ^2.1.0-rc.2 for `extractBinary` / `FORMAT_MAP` / `sanitizeLabel`.
