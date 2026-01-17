import { Logger } from '@nestjs/common';

import {
  ParameterDefinition,
  ParameterType,
  ParameterValue,
  ServiceConfig,
  ServiceReactionDefinition,
} from '@/common/service.types';
import {
  buildClickUpHeaders,
  validateTaskId,
} from '@/services/clickup/clickup.utils';

const logger = new Logger('ClickUpAddCommentReaction');

interface ClickUpCommentResponse {
  id: string;
  comment_text: string;
}

export class AddCommentReaction extends ServiceReactionDefinition {
  name = 'clickup.add_comment';
  label = 'Add Comment';
  description = 'Adds a comment to a task in ClickUp';
  input_params: ParameterDefinition[] = [
    {
      name: 'task_id',
      type: ParameterType.STRING,
      label: 'Task ID',
      description: 'The ID of the task to comment on',
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
        'Missing ClickUp access token in service config. Ensure the user connected with ClickUp.',
      );
    }

    const taskId =
      params.task_id?.value && typeof params.task_id.value === 'string'
        ? params.task_id.value
        : null;
    const commentText =
      params.comment_text?.value &&
      typeof params.comment_text.value === 'string'
        ? params.comment_text.value
        : null;

    if (!taskId) {
      throw new Error('Missing required parameter: task_id');
    }

    if (!commentText) {
      throw new Error('Missing required parameter: comment_text');
    }

    // Validate task_id format
    validateTaskId(taskId);

    const requestBody = {
      comment_text: commentText,
    };

    const res = await fetch(
      `https://api.clickup.com/api/v2/task/${taskId}/comment`,
      {
        method: 'POST',
        headers: buildClickUpHeaders(token),
        body: JSON.stringify(requestBody),
      },
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to add comment: ${res.status} ${text}`);
    }

    const result = (await res.json()) as ClickUpCommentResponse;
    logger.log(`✅ Comment added to task ${taskId}: ${result.comment_text}`);
  }

  reload_cache(_sconf?: ServiceConfig): Promise<Record<string, any>> {
    return Promise.resolve({});
  }
}
