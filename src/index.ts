/**
 * @narai/jira-agent-connector — read-only Jira connector.
 */
export {
  fetch,
  main,
  VALID_ACTIONS,
  type FetchResult,
  type FetchOptions,
} from "./cli.js";

export {
  JiraClient,
  loadJiraCredentials,
  type JiraClientOptions,
  type JiraResult,
} from "./lib/jira_client.js";
