import { Logger } from '@nestjs/common';

import {
  ParameterDefinition,
  ParameterType,
  ParameterValue,
  ServiceConfig,
  ServiceReactionDefinition,
} from '@/common/service.types';
import {
  buildNotionHeaders,
  validatePageId,
} from '@/services/notion/notion.utils';

const logger = new Logger('NotionAddCommentReaction');
export class AddCommentReaction extends ServiceReactionDefinition {
  name = 'notion.add_comment';
  label = 'Add Comment';
  description = 'Adds a comment to a page in Notion';
  input_params: ParameterDefinition[] = [
    {
      name: 'page_id',
      type: ParameterType.STRING,
      label: 'Page ID',
      description: 'The ID of the page to comment on',
      required: true,
    },
    {
      name: 'comment_text',
      type: ParameterType.STRING,
      label: 'Comment Text',
      description: 'The text of the comment to add',
      required: true,
    },
  ];

  async execute(
    sconf: ServiceConfig,
    params: Record<string, ParameterValue>,
  ): Promise<void> {
    const token = sconf?.config?.access_token as string | undefined;

    if (typeof token !== 'string' || !token) {
      throw new Error(
        'Missing Notion access token in service config. Ensure the user connected with Notion.',
      );
    }

    const pageId =
      params.page_id?.value && typeof params.page_id.value === 'string'
        ? params.page_id.value
        : null;
    const commentText =
      params.comment_text?.value &&
      typeof params.comment_text.value === 'string'
        ? params.comment_text.value
        : null;

    if (!pageId) {
      throw new Error('Missing required parameter: page_id');
    }

    if (!commentText) {
      throw new Error('Missing required parameter: comment_text');
    }

    // Validate page_id format
    validatePageId(pageId);

    const requestBody = {
      parent: {
        page_id: pageId,
      },
      rich_text: [
        {
          type: 'text',
          text: {
            content: commentText,
          },
        },
      ],
    };

    const res = await fetch(`https://api.notion.com/v1/comments`, {
      method: 'POST',
      headers: buildNotionHeaders(token),
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to add comment: ${res.status} ${text}`);
    }

    logger.log(`✅ Comment added to page: ${commentText}`);
  }

  reload_cache(_sconf?: ServiceConfig): Promise<Record<string, any>> {
    return Promise.resolve({});
  }
}
