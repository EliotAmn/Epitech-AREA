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
  validateListId,
} from '@/services/clickup/clickup.utils';

const logger = new Logger('ClickUpCreateTaskReaction');

interface ClickUpTaskResponse {
  id: string;
  name: string;
  status: {
    status: string;
  };
}

export class CreateTaskReaction extends ServiceReactionDefinition {
  name = 'clickup.create_task';
  label = 'Create Task';
  description = 'Creates a new task in a ClickUp list';
  input_params: ParameterDefinition[] = [
    {
      name: 'list_id',
      type: ParameterType.STRING,
      label: 'List ID',
      description: 'The ID of the list to create the task in',
      required: true,
    },
    {
      name: 'task_name',
      type: ParameterType.STRING,
      label: 'Task Name',
      description: 'The name of the task to create',
      required: true,
    },
    {
      name: 'description',
      type: ParameterType.STRING,
      label: 'Description',
      description: 'The description of the task',
      required: false,
    },
    {
      name: 'priority',
      type: ParameterType.STRING,
      label: 'Priority',
      description: 'Task priority (1=urgent, 2=high, 3=normal, 4=low)',
      required: false,
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

    const listId =
      params.list_id?.value && typeof params.list_id.value === 'string'
        ? params.list_id.value
        : null;
    const taskName =
      params.task_name?.value && typeof params.task_name.value === 'string'
        ? params.task_name.value
        : null;
    const description =
      params.description?.value && typeof params.description.value === 'string'
        ? params.description.value
        : '';
    const priority =
      params.priority?.value && typeof params.priority.value === 'string'
        ? parseInt(params.priority.value)
        : null;

    if (!listId) {
      throw new Error('Missing required parameter: list_id');
    }

    if (!taskName) {
      throw new Error('Missing required parameter: task_name');
    }

    // Validate list_id format
    validateListId(listId);

    const requestBody: {
      name: string;
      description?: string;
      priority?: number;
    } = {
      name: taskName,
    };

    if (description) {
      requestBody.description = description;
    }

    if (priority !== null && priority >= 1 && priority <= 4) {
      requestBody.priority = priority;
    }

    const res = await fetch(
      `https://api.clickup.com/api/v2/list/${listId}/task`,
      {
        method: 'POST',
        headers: buildClickUpHeaders(token),
        body: JSON.stringify(requestBody),
      },
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to create task: ${res.status} ${text}`);
    }

    const result = (await res.json()) as ClickUpTaskResponse;
    logger.log(`✅ Task created: ${result.name} (${result.id})`);
  }

  reload_cache(_sconf?: ServiceConfig): Promise<Record<string, any>> {
    return Promise.resolve({});
  }
}
