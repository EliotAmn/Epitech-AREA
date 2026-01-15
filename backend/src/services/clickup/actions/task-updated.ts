import { Logger } from '@nestjs/common';
import axios from 'axios';

import {
  ActionTriggerOutput,
  ParameterDefinition,
  ParameterType,
  ServiceActionDefinition,
  ServiceConfig,
} from '@/common/service.types';
import { buildClickUpHeaders } from '@/services/clickup/clickup.utils';

const logger = new Logger('ClickUpTaskUpdated');

interface ClickUpTask {
  id: string;
  name: string;
  status: {
    status: string;
    color: string;
  };
  date_created: string;
  date_updated: string;
  creator: {
    id: number;
    username: string;
  };
}

interface ClickUpTasksResponse {
  tasks: ClickUpTask[];
}

export class TaskUpdated extends ServiceActionDefinition {
  name = 'clickup.task_updated';
  label = 'On task updated';
  description = 'Triggers when a task is updated in your ClickUp workspace';
  poll_interval = 15; // Poll every 15 seconds
  output_params: ParameterDefinition[] = [
    {
      name: 'task_id',
      type: ParameterType.STRING,
      label: 'Task ID',
      description: 'The ID of the updated task',
      required: true,
    },
    {
      name: 'task_name',
      type: ParameterType.STRING,
      label: 'Task Name',
      description: 'The name of the updated task',
      required: true,
    },
    {
      name: 'status',
      type: ParameterType.STRING,
      label: 'Task Status',
      description: 'The current status of the task',
      required: false,
    },
    {
      name: 'date_updated',
      type: ParameterType.STRING,
      label: 'Updated Date',
      description: 'The timestamp when the task was last updated',
      required: true,
    },
  ];
  input_params: ParameterDefinition[] = [
    {
      name: 'list_id',
      type: ParameterType.STRING,
      label: 'List ID',
      description: 'The ClickUp list ID to monitor for updated tasks',
      required: true,
    },
  ];

  reload_cache(): Promise<Record<string, unknown>> {
    return Promise.resolve({ lastCheckTimestamp: Date.now() });
  }

  poll(sconf: ServiceConfig): Promise<ActionTriggerOutput> {
    const accessToken = sconf.config.access_token as string | undefined;
    const listId = sconf.config.list_id as string | undefined;

    if (!accessToken) {
      logger.error('No access token, skipping poll');
      return Promise.resolve({ triggered: false, parameters: {} });
    }

    if (!listId) {
      logger.error('No list_id provided, skipping poll');
      return Promise.resolve({ triggered: false, parameters: {} });
    }

    // Get last check timestamp from cache
    const lastCheckTimestamp = sconf.cache?.lastCheckTimestamp as
      | number
      | undefined;

    const checkTime = lastCheckTimestamp || Date.now() - 60000;

    return new Promise((resolve) => {
      axios
        .get<ClickUpTasksResponse>(
          `https://api.clickup.com/api/v2/list/${listId}/task`,
          {
            headers: buildClickUpHeaders(accessToken),
            params: {
              order_by: 'updated',
              reverse: true,
              subtasks: false,
              page: 0,
            },
          },
        )
        .then((resp) => {
          const data = resp.data;
          const newTimestamp = Date.now();

          if (!data || !data.tasks || data.tasks.length === 0) {
            logger.debug('No tasks found in list');
            return resolve({
              triggered: false,
              parameters: {},
              cache: { lastCheckTimestamp: newTimestamp },
            });
          }

          // Find tasks updated after last check (excluding recent creations to avoid duplicates)
          const updatedTasks = data.tasks.filter((task) => {
            const taskUpdatedTime = parseInt(task.date_updated);
            const taskCreatedTime = parseInt(task.date_created);
            return taskUpdatedTime > checkTime && taskCreatedTime < checkTime;
          });

          if (updatedTasks.length === 0) {
            logger.debug('No updated tasks since last check');
            return resolve({
              triggered: false,
              parameters: {},
              cache: { lastCheckTimestamp: newTimestamp },
            });
          }

          // Trigger on the most recently updated task
          const mostRecentTask = updatedTasks[0];

          logger.log(
            `Task updated: ${mostRecentTask.name} (${mostRecentTask.id})`,
          );

          resolve({
            triggered: true,
            parameters: {
              task_id: {
                type: ParameterType.STRING,
                value: mostRecentTask.id,
              },
              task_name: {
                type: ParameterType.STRING,
                value: mostRecentTask.name,
              },
              status: {
                type: ParameterType.STRING,
                value: mostRecentTask.status.status,
              },
              date_updated: {
                type: ParameterType.STRING,
                value: mostRecentTask.date_updated,
              },
            },
            cache: { lastCheckTimestamp: newTimestamp },
          });
        })
        .catch((err) => {
          if (axios.isAxiosError(err)) {
            logger.error(`ClickUp API error: ${err.message}`);
            logger.error(`Response: ${JSON.stringify(err.response?.data)}`);
          } else {
            logger.error(`Unexpected error: ${err}`);
          }
          resolve({
            triggered: false,
            parameters: {},
            cache: { lastCheckTimestamp: Date.now() },
          });
        });
    });
  }
}
