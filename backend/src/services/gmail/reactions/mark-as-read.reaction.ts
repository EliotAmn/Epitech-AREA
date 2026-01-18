import axios from 'axios';

import {
  ParameterType,
  ParameterValue,
  ServiceConfig,
  ServiceReactionDefinition,
} from '@/common/service.types';
import type { ParameterDefinition } from '@/common/service.types';

export class GmailMarkAsRead extends ServiceReactionDefinition {
  name = 'gmail.mark_as_read';
  label = 'Mark as read';
  description = 'Marks a message as read (removes UNREAD label)';

  input_params: ParameterDefinition[] = [
    {
      name: 'message_id',
      type: ParameterType.STRING,
      label: 'Message ID',
      description: 'Gmail message id',
      required: true,
    },
  ];

  async execute(
    sconf: ServiceConfig,
    params: Record<string, ParameterValue>,
  ): Promise<void> {
    const token =
      (sconf?.config?.access_token as string | undefined) ||
      (sconf?.config?.google_access_token as string | undefined);

    const messageId = params.message_id?.value as string;

    if (!token) throw new Error('Missing Google access token');
    if (!messageId) throw new Error('Missing message_id');

    try {
      await axios.post(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`,
        { removeLabelIds: ['UNREAD'] },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Gmail API error: ${JSON.stringify(error.response?.data || error.message)}`,
        );
      }
    }
  }

  reload_cache(_sconf?: ServiceConfig): Promise<Record<string, any>> {
    return Promise.resolve({});
  }
}
