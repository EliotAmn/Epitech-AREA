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

const logger = new Logger('ClickUpUpdateTaskReaction');

export class UpdateTaskReaction extends ServiceReactionDefinition {
  name = 'clickup.update_task';
  label = 'Update Task';
  description = 'Updates an existing task in ClickUp';
  input_params: ParameterDefinition[] = [
    {
      name: 'task_id',
      type: ParameterType.STRING,
      label: 'Task ID',
      description: 'The ID of the task to update',
      required: true,
    },
    {
      name: 'task_name',
      type: ParameterType.STRING,
      label: 'Task Name',
      description: 'The new name for the task',
      required: false,
    },
    {
      name: 'description',
      type: ParameterType.STRING,
      label: 'Description',
      description: 'The new description for the task',
      required: false,
    },
    {
      name: 'status',
      type: ParameterType.STRING,
      label: 'Status',
      description: 'The new status for the task',
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

    const taskId =
      params.task_id?.value && typeof params.task_id.value === 'string'
        ? params.task_id.value
        : null;
    const taskName =
      params.task_name?.value && typeof params.task_name.value === 'string'
        ? params.task_name.value
        : null;
    const description =
      params.description?.value && typeof params.description.value === 'string'
        ? params.description.value
        : null;
    const status =
      params.status?.value && typeof params.status.value === 'string'
        ? params.status.value
        : null;
    const priority =
      params.priority?.value && typeof params.priority.value === 'string'
        ? parseInt(params.priority.value)
        : null;

    if (!taskId) {
      throw new Error('Missing required parameter: task_id');
    }

    // Validate task_id format
    validateTaskId(taskId);

    // Validate that at least one update parameter is provided
    if (!taskName && !description && !status && priority === null) {
      throw new Error(
        'At least one of task_name, description, status, or priority must be provided',
      );
    }

    const requestBody: {
      name?: string;
      description?: string;
      status?: string;
      priority?: number;
    } = {};

    if (taskName) {
      requestBody.name = taskName;
    }

    if (description) {
      requestBody.description = description;
    }

    if (status) {
      requestBody.status = status;
    }

    if (priority !== null && priority >= 1 && priority <= 4) {
      requestBody.priority = priority;
    }

    const res = await fetch(`https://api.clickup.com/api/v2/task/${taskId}`, {
      method: 'PUT',
      headers: buildClickUpHeaders(token),
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to update task: ${res.status} ${text}`);
    }

    logger.log(`✅ Task updated: ${taskId}`);
  }

  reload_cache(_sconf?: ServiceConfig): Promise<Record<string, any>> {
    return Promise.resolve({});
  }
}
