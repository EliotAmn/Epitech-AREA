import { Logger } from '@nestjs/common';
import axios from 'axios';

import { ParameterType, ServiceActionDefinition } from '@/common/service.types';
import type {
  ActionTriggerOutput,
  ParameterDefinition,
  ServiceConfig,
} from '@/common/service.types';
import { buildNotionHeaders } from '@/services/notion/notion.utils';

const logger = new Logger('NotionPageCreated');

interface NotionPage {
  id: string;
  created_time: string;
  last_edited_time: string;
  properties: {
    title?: {
      title: Array<{
        plain_text: string;
      }>;
    };
  };
}

interface NotionSearchResponse {
  results: NotionPage[];
  has_more: boolean;
  next_cursor: string | null;
}

export class PageCreated extends ServiceActionDefinition {
  name = 'notion.page_created';
  label = 'On page created';
  description = 'Triggers when a new page is created in your Notion workspace';
  poll_interval = 15; // Poll every 15 seconds
  output_params: ParameterDefinition[] = [
    {
      name: 'page_id',
      type: ParameterType.STRING,
      label: 'Page ID',
      description: 'The ID of the created page',
      required: true,
    },
    {
      name: 'page_title',
      type: ParameterType.STRING,
      label: 'Page Title',
      description: 'The title of the created page',
      required: false,
    },
    {
      name: 'created_time',
      type: ParameterType.STRING,
      label: 'Created Time',
      description: 'The ISO timestamp when the page was created',
      required: true,
    },
  ];
  input_params: ParameterDefinition[] = [];

  reload_cache(): Promise<Record<string, unknown>> {
    return Promise.resolve({ lastCheckTimestamp: new Date().toISOString() });
  }

  poll(sconf: ServiceConfig): Promise<ActionTriggerOutput> {
    const accessToken = sconf.config.access_token as string | undefined;
    if (!accessToken) {
      logger.error('No access token, skipping poll');
      return Promise.resolve({ triggered: false, parameters: {} });
    }

    // Get last check timestamp from cache
    const lastCheckTimestamp = sconf.cache?.lastCheckTimestamp as
      | string
      | undefined;

    const checkTime =
      lastCheckTimestamp || new Date(Date.now() - 60000).toISOString();

    return new Promise((resolve) => {
      axios
        .post<NotionSearchResponse>(
          'https://api.notion.com/v1/search',
          {
            filter: {
              value: 'page',
              property: 'object',
            },
            sort: {
              direction: 'descending',
              timestamp: 'last_edited_time',
            },
            page_size: 10,
          },
          {
            headers: buildNotionHeaders(accessToken),
          },
        )
        .then((resp) => {
          const data = resp.data;
          const newTimestamp = new Date().toISOString();
          if (!data || !data.results || data.results.length === 0) {
            return resolve({
              triggered: false,
              parameters: {},
              cache: { lastCheckTimestamp: newTimestamp },
            });
          }

          // Find the most recent page created after last check
          // Use string comparison for ISO timestamps (works correctly without timezone conversion)
          const newPages = data.results.filter(
            (page) => page.created_time > checkTime,
          );

          if (newPages.length === 0) {
            return resolve({
              triggered: false,
              parameters: {},
              cache: { lastCheckTimestamp: newTimestamp },
            });
          }

          // Trigger on the most recent new page
          const newestPage = newPages[0];
          const pageTitle =
            newestPage.properties.title?.title?.[0]?.plain_text || 'Untitled';

          resolve({
            triggered: true,
            parameters: {
              page_id: { type: ParameterType.STRING, value: newestPage.id },
              page_title: { type: ParameterType.STRING, value: pageTitle },
              created_time: {
                type: ParameterType.STRING,
                value: newestPage.created_time,
              },
            },
            cache: { lastCheckTimestamp: newTimestamp },
          });
        })
        .catch((err) => {
          if (axios.isAxiosError(err)) {
            logger.error('Error polling page creation:');
            logger.error(`Status: ${err.response?.status}`);
            logger.error(`Response: ${JSON.stringify(err.response?.data)}`);
          } else {
            logger.error('Error polling page creation:', err);
          }
          resolve({
            triggered: false,
            parameters: {},
            cache: { lastCheckTimestamp: checkTime },
          });
        });
    });
  }
}
