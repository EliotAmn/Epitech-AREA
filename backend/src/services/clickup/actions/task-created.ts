import axios from 'axios';
import { Logger } from '@nestjs/common';

import {
  ActionTriggerOutput,
  ParameterDefinition,
  ParameterType,
  ServiceActionDefinition,
  ServiceConfig,
} from '@/common/service.types';
import { buildClickUpHeaders } from '@/services/clickup/clickup.utils';

const logger = new Logger('ClickUpTaskCreated');

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

export class TaskCreated extends ServiceActionDefinition {
  name = 'clickup.task_created';
  label = 'On task created';
  description = 'Triggers when a new task is created in your ClickUp workspace';
  poll_interval = 15; // Poll every 15 seconds
  output_params: ParameterDefinition[] = [
    {
      name: 'task_id',
      type: ParameterType.STRING,
      label: 'Task ID',
      description: 'The ID of the created task',
      required: true,
    },
    {
      name: 'task_name',
      type: ParameterType.STRING,
      label: 'Task Name',
      description: 'The name of the created task',
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
      name: 'date_created',
      type: ParameterType.STRING,
      label: 'Created Date',
      description: 'The timestamp when the task was created',
      required: true,
    },
  ];
  input_params: ParameterDefinition[] = [
    {
      name: 'list_id',
      type: ParameterType.STRING,
      label: 'List ID',
      description: 'The ClickUp list ID to monitor for new tasks',
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
              order_by: 'created',
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

          // Find tasks created after last check
          const newTasks = data.tasks.filter((task) => {
            const taskCreatedTime = parseInt(task.date_created);
            return taskCreatedTime > checkTime;
          });

          if (newTasks.length === 0) {
            logger.debug('No new tasks since last check');
            return resolve({
              triggered: false,
              parameters: {},
              cache: { lastCheckTimestamp: newTimestamp },
            });
          }

          // Trigger on the most recent new task
          const newestTask = newTasks[0];

          logger.log(`New task created: ${newestTask.name} (${newestTask.id})`);

          resolve({
            triggered: true,
            parameters: {
              task_id: { type: ParameterType.STRING, value: newestTask.id },
              task_name: { type: ParameterType.STRING, value: newestTask.name },
              status: {
                type: ParameterType.STRING,
                value: newestTask.status.status,
              },
              date_created: {
                type: ParameterType.STRING,
                value: newestTask.date_created,
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
