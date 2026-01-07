import {
  ParameterDefinition,
  ParameterType,
  ParameterValue,
  ServiceConfig,
  ServiceReactionDefinition,
} from '@/common/service.types';

export class ArchivePageReaction extends ServiceReactionDefinition {
  name = 'archive_page';
  label = 'Archive Page';
  description = 'Archives (soft deletes) a page in Notion';
  input_params: ParameterDefinition[] = [
    {
      name: 'page_id',
      type: ParameterType.STRING,
      label: 'Page ID',
      description: 'The ID of the page to archive',
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
        'Missing Notion access token in service config. Ensure the user connected with Notion.',
      );
    }

    const pageId =
      params.page_id?.value && typeof params.page_id.value === 'string'
        ? params.page_id.value
        : null;

    if (!pageId) {
      throw new Error('Missing required parameter: page_id');
    }

    const requestBody = {
      archived: true,
    };

    const res = await fetch(
      `https://api.notion.com/v1/pages/${pageId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      },
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to archive page: ${res.status} ${text}`);
    }

    console.log(`✅ Page archived: ${pageId}`);
  }

  reload_cache(_sconf?: ServiceConfig): Promise<Record<string, any>> {
    return Promise.resolve({});
  }
}
