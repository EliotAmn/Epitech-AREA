import axios from 'axios';

import { ParameterType, ServiceActionDefinition } from '@/common/service.types';
import type {
  ActionTriggerOutput,
  ParameterDefinition,
  ServiceConfig,
} from '@/common/service.types';

interface TodoistTask {
  id: string;
  content: string;
  description: string;
  project_id: string;
  priority: number;
  due?: {
    date: string;
    string: string;
  };
  created_at: string;
}

interface TodoistTasksResponse {
  results: TodoistTask[];
  next_cursor?: string;
}

export class TodoistTaskCreated extends ServiceActionDefinition {
  name = 'todoist.task_created';
  label = 'New Task Created';
  description =
    'Triggers when a new task is created in a specific Todoist project';
  poll_interval = 60;

  input_params: ParameterDefinition[] = [
    {
      name: 'project_id',
      type: ParameterType.STRING,
      label: 'Project ID',
      description:
        'The Todoist project ID (get it from API: curl "https://api.todoist.com/api/v1/projects" -H "Authorization: Bearer TOKEN"). Leave empty to monitor all projects.',
      required: false,
    },
  ];

  output_params: ParameterDefinition[] = [
    {
      name: 'task_id',
      type: ParameterType.STRING,
      label: 'Task ID',
      description: 'The ID of the newly created task',
      required: true,
    },
    {
      name: 'content',
      type: ParameterType.STRING,
      label: 'Task Title',
      description: 'The title/content of the task',
      required: true,
    },
    {
      name: 'description',
      type: ParameterType.STRING,
      label: 'Task Description',
      description: 'The description of the task',
      required: false,
    },
    {
      name: 'priority',
      type: ParameterType.NUMBER,
      label: 'Priority',
      description: 'Priority of the task (1-4, where 4 is urgent)',
      required: true,
    },
    {
      name: 'project_id',
      type: ParameterType.STRING,
      label: 'Project ID',
      description: 'The project ID the task belongs to',
      required: true,
    },
    {
      name: 'due_date',
      type: ParameterType.STRING,
      label: 'Due Date',
      description: 'The due date of the task if set',
      required: false,
    },
  ];

  async reload_cache(sconf: ServiceConfig): Promise<Record<string, unknown>> {
    const accessToken = sconf.config.access_token as string | undefined;
    let projectId = sconf.config.project_id as string | undefined;

    if (!accessToken) {
      return { lastTaskId: null };
    }

    // Extract project ID from URL if user provided the full URL
    if (projectId && projectId.includes('/')) {
      const parts = projectId.split('/');
      projectId = parts[parts.length - 1];
      console.log(`[Todoist] Extracted project ID "${projectId}" from URL`);
    }

    // If format is "slug-ID", extract just the ID part
    if (projectId && projectId.includes('-')) {
      const idParts = projectId.split('-');
      if (idParts.length > 1) {
        const potentialId = idParts[idParts.length - 1];
        // Check if last part looks like a Todoist ID (alphanumeric, reasonable length)
        if (potentialId.length > 10 && /^[a-zA-Z0-9]+$/.test(potentialId)) {
          console.log(
            `[Todoist] Extracted ID "${potentialId}" from slug format "${projectId}"`,
          );
          projectId = potentialId;
        }
      }
    }

    try {
      const params: Record<string, string> = { limit: '1' };
      if (projectId) {
        params.project_id = projectId;
      }

      const resp = await axios.get<TodoistTasksResponse>(
        'https://api.todoist.com/api/v1/tasks',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params,
        },
      );

      if (resp.data?.results && resp.data.results.length > 0) {
        return { lastTaskId: resp.data.results[0].id };
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        console.error(
          `[Todoist] Invalid project_id "${projectId}". ` +
            `The project ID from the URL might not match the API ID. ` +
            `Please use: curl "https://api.todoist.com/api/v1/projects" -H "Authorization: Bearer YOUR_TOKEN" ` +
            `to get the correct project ID from the API response`,
        );
      } else {
        console.warn(
          `[Todoist] Failed to fetch initial task for project ${projectId || 'all'}:`,
          error,
        );
      }
    }
    return { lastTaskId: null };
  }

  async poll(sconf: ServiceConfig): Promise<ActionTriggerOutput> {
    const accessToken = sconf.config.access_token as string | undefined;
    let projectId = sconf.config.project_id as string | undefined;

    if (!accessToken) {
      return { triggered: false, parameters: {} };
    }

    // Extract project ID from URL if user provided the full URL
    if (projectId && projectId.includes('/')) {
      const parts = projectId.split('/');
      projectId = parts[parts.length - 1];
    }

    // If format is "slug-ID", extract just the ID part
    if (projectId && projectId.includes('-')) {
      const idParts = projectId.split('-');
      if (idParts.length > 1) {
        const potentialId = idParts[idParts.length - 1];
        if (potentialId.length > 10 && /^[a-zA-Z0-9]+$/.test(potentialId)) {
          projectId = potentialId;
        }
      }
    }

    const lastTaskId = sconf.cache?.lastTaskId as string | null;

    try {
      const params: Record<string, string> = { limit: '50' };
      if (projectId) {
        params.project_id = projectId;
      }

      const resp = await axios.get<TodoistTasksResponse>(
        'https://api.todoist.com/api/v1/tasks',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params,
        },
      );

      const tasks = resp.data?.results || [];

      if (tasks.length === 0) {
        return { triggered: false, parameters: {} };
      }

      const latestTask = tasks[0];

      // First time polling - just store the latest task ID
      if (!lastTaskId) {
        return {
          triggered: false,
          parameters: {},
          cache: { lastTaskId: latestTask.id },
        };
      }

      // Check if there's a new task (different ID from the last known one)
      if (lastTaskId === latestTask.id) {
        return { triggered: false, parameters: {} };
      }

      // Find the new task (should be the first one if tasks are sorted by creation date desc)
      // Todoist API returns tasks sorted by creation date (newest first) by default
      const newTask = latestTask;

      return {
        triggered: true,
        parameters: {
          task_id: {
            type: ParameterType.STRING,
            value: newTask.id,
          },
          content: {
            type: ParameterType.STRING,
            value: newTask.content,
          },
          description: {
            type: ParameterType.STRING,
            value: newTask.description || '',
          },
          priority: {
            type: ParameterType.NUMBER,
            value: newTask.priority,
          },
          project_id: {
            type: ParameterType.STRING,
            value: newTask.project_id,
          },
          due_date: {
            type: ParameterType.STRING,
            value: newTask.due?.string || '',
          },
        },
        cache: { lastTaskId: newTask.id },
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          console.error(
            `[Todoist] Invalid project_id "${projectId}". ` +
              `The project ID from the URL might not match the API ID. ` +
              `Please use: curl "https://api.todoist.com/api/v1/projects" -H "Authorization: Bearer YOUR_TOKEN" ` +
              `to get the correct project ID from the API response`,
          );
        } else {
          console.error(
            `[Todoist] Error polling tasks:`,
            error.response?.data || error.message,
          );
        }
      } else {
        console.error(`[Todoist] Error polling tasks:`, error);
      }
      return { triggered: false, parameters: {} };
    }
  }
}
