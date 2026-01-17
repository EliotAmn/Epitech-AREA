/**
 * Shared utilities and constants for ClickUp service
 */

/**
 * Validates a ClickUp task ID format
 */
export function validateTaskId(taskId: string): void {
  if (!taskId || typeof taskId !== 'string') {
    throw new Error('Invalid task_id: must be a non-empty string');
  }

  // ClickUp task IDs are alphanumeric strings
  if (!/^[a-z0-9]+$/i.test(taskId)) {
    throw new Error(
      `Invalid task_id format: "${taskId}". Expected a valid ClickUp task ID`,
    );
  }
}

/**
 * Validates a ClickUp list ID format
 */
export function validateListId(listId: string): void {
  if (!listId || typeof listId !== 'string') {
    throw new Error('Invalid list_id: must be a non-empty string');
  }

  // ClickUp list IDs are numeric strings
  if (!/^\d+$/.test(listId)) {
    throw new Error(
      `Invalid list_id format: "${listId}". Expected a valid ClickUp list ID (numeric)`,
    );
  }
}

/**
 * Builds standard headers for ClickUp API requests
 */
export function buildClickUpHeaders(
  accessToken: string,
): Record<string, string> {
  return {
    Authorization: accessToken,
    'Content-Type': 'application/json',
  };
}
