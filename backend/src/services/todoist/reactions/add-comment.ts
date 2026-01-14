import axios from 'axios';

import {
  ParameterType,
  ParameterValue,
  ServiceConfig,
  ServiceReactionDefinition,
} from '@/common/service.types';
import type { ParameterDefinition } from '@/common/service.types';

export class TodoistAddComment extends ServiceReactionDefinition {
  name = 'todoist.add_comment';
  label = 'Add Comment to Task';
  description = 'Adds a comment to a Todoist task';

  input_params: ParameterDefinition[] = [
    {
      name: 'task_id',
      type: ParameterType.STRING,
      label: 'Task ID',
      description:
        'The ID of the task to comment on (can be provided by trigger)',
      required: true,
    },
    {
      name: 'message',
      type: ParameterType.STRING,
      label: 'Comment Content',
      description:
        'The comment text (supports markdown and variable substitution like $(content))',
      required: true,
    },
  ];

  async execute(
    sconf: ServiceConfig,
    params: Record<string, ParameterValue>,
  ): Promise<void> {
    const accessToken = sconf.config.access_token as string | undefined;
    const taskId = params.task_id?.value as string;
    const message = params.message?.value as string;

    if (!accessToken) {
      throw new Error('Missing Todoist access token');
    }
    if (!taskId) {
      throw new Error('Missing task_id for Todoist comment');
    }
    if (!message) {
      throw new Error('Missing message content for Todoist comment');
    }

    try {
      await axios.post(
        'https://api.todoist.com/api/v1/comments',
        {
          task_id: taskId,
          content: message,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Todoist API error: ${JSON.stringify(error.response?.data || error.message)}`,
        );
      }
      throw new Error(
        `Todoist API error: ${JSON.stringify((error as Error).message || error)}`,
      );
    }
  }

  reload_cache(_sconf?: ServiceConfig): Promise<Record<string, any>> {
    return Promise.resolve({});
  }
}
