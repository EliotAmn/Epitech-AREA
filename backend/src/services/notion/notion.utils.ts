/**
 * Shared utilities and constants for Notion service
 */

export const NOTION_API_VERSION = '2022-06-28';

/**
 * Validates a Notion page ID format
 * Notion IDs are typically 32 hex characters with optional hyphens
 */
export function validatePageId(pageId: string): void {
  if (!pageId || typeof pageId !== 'string') {
    throw new Error('Invalid page_id: must be a non-empty string');
  }

  // Remove hyphens for validation
  const cleanId = pageId.replace(/-/g, '');

  // Notion IDs should be 32 hex characters (UUID without hyphens)
  if (!/^[0-9a-f]{32}$/i.test(cleanId)) {
    throw new Error(
      `Invalid page_id format: "${pageId}". Expected a valid Notion page ID (32 hexadecimal characters)`,
    );
  }
}

/**
 * Builds standard headers for Notion API requests
 */
export function buildNotionHeaders(accessToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    'Notion-Version': NOTION_API_VERSION,
    'Content-Type': 'application/json',
  };
}
