import {
  ParameterDefinition,
  ParameterType,
  ParameterValue,
  ServiceConfig,
  ServiceReactionDefinition,
} from '@/common/service.types';

export class UpdatePageReaction extends ServiceReactionDefinition {
  name = 'update_page';
  label = 'Update Page';
  description = 'Updates an existing page title or adds content';
  input_params: ParameterDefinition[] = [
    {
      name: 'page_id',
      type: ParameterType.STRING,
      label: 'Page ID',
      description: 'The ID of the page to update',
      required: true,
    },
    {
      name: 'title',
      type: ParameterType.STRING,
      label: 'Page Title',
      description: 'The new title for the page',
      required: false,
    },
    {
      name: 'content',
      type: ParameterType.STRING,
      label: 'Content to Append',
      description: 'Text content to append to the page',
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
        'Missing Notion access token in service config. Ensure the user connected with Notion.',
      );
    }

    const pageId =
      params.page_id?.value && typeof params.page_id.value === 'string'
        ? params.page_id.value
        : null;
    const title =
      params.title?.value && typeof params.title.value === 'string'
        ? params.title.value
        : null;
    const content =
      params.content?.value && typeof params.content.value === 'string'
        ? params.content.value
        : null;

    if (!pageId) {
      throw new Error('Missing required parameter: page_id');
    }

    // Update page title if provided
    if (title) {
      const titleUpdateBody = {
        properties: {
          title: {
            title: [
              {
                text: {
                  content: title,
                },
              },
            ],
          },
        },
      };

      const titleRes = await fetch(
        `https://api.notion.com/v1/pages/${pageId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(titleUpdateBody),
        },
      );

      if (!titleRes.ok) {
        const text = await titleRes.text();
        throw new Error(`Failed to update page title: ${titleRes.status} ${text}`);
      }

      console.log(`✅ Page title updated: ${title}`);
    }

    // Append content if provided
    if (content) {
      const blockBody = {
        children: [
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content: content,
                  },
                },
              ],
            },
          },
        ],
      };

      const blockRes = await fetch(
        `https://api.notion.com/v1/blocks/${pageId}/children`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(blockBody),
        },
      );

      if (!blockRes.ok) {
        const text = await blockRes.text();
        throw new Error(
          `Failed to append content to page: ${blockRes.status} ${text}`,
        );
      }

      console.log('✅ Content appended to page');
    }

    if (!title && !content) {
      throw new Error('At least one of title or content must be provided');
    }
  }

  reload_cache(_sconf?: ServiceConfig): Promise<Record<string, any>> {
    return Promise.resolve({});
  }
}
