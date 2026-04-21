# Changelog

## 2.1.0 — 2026-04-21

### Added

- `list_attachments(issue_key)` — list attachments on an issue (read from `fields.attachment`).
- `get_attachment(issue_key, attachment_id)` — download an attachment, sha256-checksum, extract PDF/DOCX/PPTX/text via the toolkit's extractors.
- `get_comments(issue_key, max_results?)` — list comments with ADF→plain body conversion.
- Client methods: `listAttachments`, `getAttachmentDownload`, `getComments`, plus `siteUrl` getter.
- Internal `src/lib/adf.ts` — ADF (Atlassian Document Format) → plain-text walker used by `getComments` and reusable for issue descriptions.

### Changed

- Dependency bump: `@narai/connector-toolkit` ^2.1.0-rc.2 for `extractBinary` / `FORMAT_MAP` / `sanitizeLabel`.
