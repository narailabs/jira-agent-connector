/**
 * @narai/jira-agent-connector — read-only Jira connector.
 *
 * Built on @narai/connector-toolkit. The default export is a ready-to-use
 * `Connector` instance; `buildJiraConnector(overrides?)` is exposed for
 * tests that want to inject a fake Jira client.
 */
import { createConnector, type Connector, type ErrorCode } from "@narai/connector-toolkit";
import { z } from "zod";
import {
  JiraClient,
  loadJiraCredentials,
  type JiraResult,
} from "./lib/jira_client.js";
import { JiraError } from "./lib/jira_error.js";

// ───────────────────────────────────────────────────────────────────────────
// Param schemas
// ───────────────────────────────────────────────────────────────────────────

const MAX_RESULTS_DEFAULT = 50;
const MAX_RESULTS_CAP = 500;

const jqlSearchParams = z.object({
  jql: z.string().min(1, "jql_search requires a non-empty 'jql' string"),
  max_results: z.coerce
    .number()
    .int()
    .positive()
    .default(MAX_RESULTS_DEFAULT),
});

const getIssueParams = z.object({
  issue_key: z
    .string()
    .regex(
      /^[A-Z][A-Z0-9]+-\d+$/,
      "Invalid issue_key — expected format like PROJ-123",
    ),
  expand: z.array(z.string()).default([]),
});

const getProjectParams = z.object({
  project_key: z
    .string()
    .regex(
      /^[A-Z][A-Z0-9]+$/,
      "Invalid project_key — expected format like PROJ",
    ),
});

// ───────────────────────────────────────────────────────────────────────────
// Error-code translation
// ───────────────────────────────────────────────────────────────────────────

const CODE_MAP: Record<string, ErrorCode> = {
  UNAUTHORIZED: "AUTH_ERROR",
  NOT_FOUND: "NOT_FOUND",
  RATE_LIMITED: "RATE_LIMITED",
  TIMEOUT: "TIMEOUT",
  NETWORK_ERROR: "CONNECTION_ERROR",
  SERVER_ERROR: "CONNECTION_ERROR",
  BAD_REQUEST: "VALIDATION_ERROR",
  INVALID_URL: "VALIDATION_ERROR",
  METHOD_NOT_ALLOWED: "VALIDATION_ERROR",
  HTTP_ERROR: "CONNECTION_ERROR",
  CONFIG_ERROR: "CONFIG_ERROR",
};

function throwIfError<T>(
  result: JiraResult<T>,
): asserts result is Extract<JiraResult<T>, { ok: true }> {
  if (!result.ok) {
    throw new JiraError(
      result.code,
      result.message,
      result.retriable,
      result.status,
    );
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Connector factory
// ───────────────────────────────────────────────────────────────────────────

export interface BuildOptions {
  sdk?: () => Promise<JiraClient>;
  credentials?: () => Promise<Record<string, unknown>>;
}

export function buildJiraConnector(overrides: BuildOptions = {}): Connector {
  const defaultCredentials = async (): Promise<Record<string, unknown>> => {
    const creds = await loadJiraCredentials();
    return (creds as unknown as Record<string, unknown> | null) ?? {};
  };

  const defaultSdk = async (): Promise<JiraClient> => {
    const creds = await loadJiraCredentials();
    if (!creds) {
      throw new JiraError(
        "CONFIG_ERROR",
        "Jira credentials not configured. Set JIRA_SITE_URL, JIRA_EMAIL, and " +
          "JIRA_API_TOKEN (or register a credential provider via " +
          "@narai/credential-providers).",
        false,
      );
    }
    return new JiraClient(creds);
  };

  return createConnector<JiraClient>({
    name: "jira",
    version: "2.0.0",
    credentials: overrides.credentials ?? defaultCredentials,
    sdk: overrides.sdk ?? defaultSdk,
    actions: {
      jql_search: {
        description: "Search Jira issues with a JQL query",
        params: jqlSearchParams,
        classify: { kind: "read" },
        handler: async (p: z.infer<typeof jqlSearchParams>, ctx) => {
          const limit = Math.min(p.max_results, MAX_RESULTS_CAP);
          const result = await ctx.sdk.searchJql(p.jql, limit);
          throwIfError(result);
          const total = typeof result.data.total === "number" ? result.data.total : 0;
          const issues = Array.isArray(result.data.issues)
            ? result.data.issues
            : [];
          return {
            total,
            issues: issues.slice(0, limit).map((i) => ({
              key: i.key,
              summary: i.fields?.summary ?? "",
              status: i.fields?.status?.name ?? "",
              assignee: i.fields?.assignee?.displayName ?? null,
              labels: i.fields?.labels ?? [],
              updated: i.fields?.updated ?? null,
            })),
            truncated: issues.length > limit,
          };
        },
      },
      get_issue: {
        description: "Fetch a single Jira issue by key (e.g. PROJ-123)",
        params: getIssueParams,
        classify: { kind: "read" },
        handler: async (p: z.infer<typeof getIssueParams>, ctx) => {
          const result = await ctx.sdk.getIssue(p.issue_key, p.expand);
          throwIfError(result);
          const fields = result.data.fields ?? {};
          return {
            key: result.data.key,
            summary: fields.summary ?? "",
            status: fields.status?.name ?? "",
            assignee: fields.assignee?.displayName ?? null,
            labels: fields.labels ?? [],
            updated: fields.updated ?? null,
          };
        },
      },
      get_project: {
        description: "Fetch Jira project metadata by key (e.g. PROJ)",
        params: getProjectParams,
        classify: { kind: "read" },
        handler: async (p: z.infer<typeof getProjectParams>, ctx) => {
          const result = await ctx.sdk.getProject(p.project_key);
          throwIfError(result);
          return {
            key: result.data.key,
            name: result.data.name ?? "",
            description: result.data.description ?? "",
            lead: result.data.lead?.displayName ?? null,
            issue_types: (result.data.issueTypes ?? []).map((t) => t.name ?? ""),
          };
        },
      },
    },
    mapError: (err) => {
      if (err instanceof JiraError) {
        return {
          error_code: CODE_MAP[err.code] ?? "CONNECTION_ERROR",
          message: err.message,
          retriable: err.retriable,
        };
      }
      return undefined;
    },
  });
}

// Default production connector.
const connector = buildJiraConnector();
export default connector;
export const { main, fetch, validActions } = connector;

export {
  JiraClient,
  loadJiraCredentials,
  type JiraClientOptions,
  type JiraResult,
} from "./lib/jira_client.js";
export { JiraError } from "./lib/jira_error.js";
