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

const logger = new Logger('ClickUpChangeStatusReaction');

export class ChangeStatusReaction extends ServiceReactionDefinition {
  name = 'clickup.change_status';
  label = 'Change Task Status';
  description = 'Changes the status of a task in ClickUp';
  input_params: ParameterDefinition[] = [
    {
      name: 'task_id',
      type: ParameterType.STRING,
      label: 'Task ID',
      description: 'The ID of the task to update',
      required: true,
    },
    {
      name: 'status',
      type: ParameterType.STRING,
      label: 'Status',
      description: 'The new status for the task (e.g., "open", "in progress", "closed")',
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
    const status =
      params.status?.value && typeof params.status.value === 'string'
        ? params.status.value
        : null;

    if (!taskId) {
      throw new Error('Missing required parameter: task_id');
    }

    if (!status) {
      throw new Error('Missing required parameter: status');
    }

    // Validate task_id format
    validateTaskId(taskId);

    const requestBody = {
      status: status,
    };

    const res = await fetch(
      `https://api.clickup.com/api/v2/task/${taskId}`,
      {
        method: 'PUT',
        headers: buildClickUpHeaders(token),
        body: JSON.stringify(requestBody),
      },
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to change task status: ${res.status} ${text}`);
    }

    logger.log(`✅ Task ${taskId} status changed to: ${status}`);
  }

  reload_cache(_sconf?: ServiceConfig): Promise<Record<string, any>> {
    return Promise.resolve({});
  }
}
