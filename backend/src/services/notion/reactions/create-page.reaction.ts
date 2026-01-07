import {
  ParameterDefinition,
  ParameterType,
  ParameterValue,
  ServiceConfig,
  ServiceReactionDefinition,
} from '@/common/service.types';

export class CreatePageReaction extends ServiceReactionDefinition {
  name = 'create_page';
  label = 'Create Page';
  description =
    'Creates a new page in your Notion workspace with the specified title and content';
  input_params: ParameterDefinition[] = [
    {
      name: 'parent_page_id',
      type: ParameterType.STRING,
      label: 'Parent Page ID',
      description:
        'The ID of the parent page or database (leave empty to create in workspace root)',
      required: false,
    },
    {
      name: 'title',
      type: ParameterType.STRING,
      label: 'Page Title',
      description: 'The title of the new page',
      required: true,
    },
    {
      name: 'content',
      type: ParameterType.STRING,
      label: 'Page Content',
      description: 'The text content for the page body',
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

    const parentPageId =
      params.parent_page_id?.value &&
      typeof params.parent_page_id.value === 'string'
        ? params.parent_page_id.value
        : null;
    const title =
      params.title?.value && typeof params.title.value === 'string'
        ? params.title.value
        : null;
    const content =
      params.content?.value && typeof params.content.value === 'string'
        ? params.content.value
        : '';

    if (!title) {
      throw new Error('Missing required parameter: title');
    }

    // Build the parent object
    let parent: { type: string; page_id?: string };
    if (parentPageId) {
      parent = {
        type: 'page_id',
        page_id: parentPageId,
      };
    } else {
      // If no parent specified, use workspace as parent
      parent = {
        type: 'workspace',
      };
    }

    // Build the page properties (title)
    const properties = {
      title: {
        title: [
          {
            text: {
              content: title,
            },
          },
        ],
      },
    };

    // Build the page content (children blocks)
    const children: any[] = [];
    if (content) {
      children.push({
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
      });
    }

    const requestBody: any = {
      parent,
      properties,
    };

    if (children.length > 0) {
      requestBody.children = children;
    }

    const url = 'https://api.notion.com/v1/pages';

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Notion API error: ${res.status} ${text}`);
    }

    const result = await res.json();
    console.log('✅ Notion page created:', result.id);
  }

  reload_cache(_sconf?: ServiceConfig): Promise<Record<string, any>> {
    return Promise.resolve({});
  }
}
