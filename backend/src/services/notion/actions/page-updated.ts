import axios from 'axios';

import { ParameterType, ServiceActionDefinition } from '@/common/service.types';
import type {
  ActionTriggerOutput,
  ParameterDefinition,
  ServiceConfig,
} from '@/common/service.types';

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

export class PageUpdated extends ServiceActionDefinition {
  name = 'notion.page_updated';
  label = 'On page updated';
  description = 'Triggers when a page is modified in your Notion workspace';
  poll_interval = 15; // Poll every 15 seconds
  output_params: ParameterDefinition[] = [
    {
      name: 'page_id',
      type: ParameterType.STRING,
      label: 'Page ID',
      description: 'The ID of the updated page',
      required: true,
    },
    {
      name: 'page_title',
      type: ParameterType.STRING,
      label: 'Page Title',
      description: 'The title of the updated page',
      required: false,
    },
    {
      name: 'last_edited_time',
      type: ParameterType.STRING,
      label: 'Last Edited Time',
      description: 'The ISO timestamp when the page was last edited',
      required: true,
    },
  ];
  input_params: ParameterDefinition[] = [];

  reload_cache(): Promise<Record<string, unknown>> {
    return Promise.resolve({ lastCheckTimestamp: new Date().toISOString() });
  }

  poll(sconf: ServiceConfig): Promise<ActionTriggerOutput> {
    const accessToken = sconf.config.access_token as string | undefined;
    if (!accessToken)
      return Promise.resolve({ triggered: false, parameters: {} });

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
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Notion-Version': '2022-06-28',
              'Content-Type': 'application/json',
            },
          },
        )
        .then((resp) => {
          const data = resp.data;
          if (!data || !data.results || data.results.length === 0) {
            return resolve({
              triggered: false,
              parameters: {},
              cache: { lastCheckTimestamp: checkTime },
            });
          }

          // Find pages edited after last check (excluding very recent creation to avoid duplicates with page_created)
          const editedPages = data.results.filter(
            (page) =>
              page.last_edited_time > checkTime &&
              page.created_time < checkTime,
          );

          if (editedPages.length === 0) {
            return resolve({
              triggered: false,
              parameters: {},
              cache: { lastCheckTimestamp: checkTime },
            });
          }

          // Trigger on the most recently edited page
          const mostRecentPage = editedPages[0];
          const pageTitle =
            mostRecentPage.properties.title?.title?.[0]?.plain_text ||
            'Untitled';

          console.log(
            `[Notion] Page updated: ${pageTitle} (${mostRecentPage.id})`,
          );

          resolve({
            triggered: true,
            parameters: {
              page_id: { type: ParameterType.STRING, value: mostRecentPage.id },
              page_title: { type: ParameterType.STRING, value: pageTitle },
              last_edited_time: {
                type: ParameterType.STRING,
                value: mostRecentPage.last_edited_time,
              },
            },
            cache: { lastCheckTimestamp: checkTime },
          });
        })
        .catch((err) => {
          console.error('Error polling Notion page updates:', err);
          resolve({
            triggered: false,
            parameters: {},
            cache: { lastCheckTimestamp: checkTime },
          });
        });
    });
  }
}
