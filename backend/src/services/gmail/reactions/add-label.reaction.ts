import axios from 'axios';

import {
  ParameterType,
  ParameterValue,
  ServiceConfig,
  ServiceReactionDefinition,
} from '@/common/service.types';
import type { ParameterDefinition } from '@/common/service.types';

const LABEL_OPTIONS = [
  { label: 'CHAT', value: 'CHAT' },
  { label: 'SENT', value: 'SENT' },
  { label: 'INBOX', value: 'INBOX' },
  { label: 'IMPORTANT', value: 'IMPORTANT' },
  { label: 'TRASH', value: 'TRASH' },
  { label: 'DRAFT', value: 'DRAFT' },
  { label: 'SPAM', value: 'SPAM' },
  { label: 'CATEGORY_FORUMS', value: 'CATEGORY_FORUMS' },
  { label: 'CATEGORY_UPDATES', value: 'CATEGORY_UPDATES' },
  { label: 'CATEGORY_PERSONAL', value: 'CATEGORY_PERSONAL' },
  { label: 'CATEGORY_PROMOTIONS', value: 'CATEGORY_PROMOTIONS' },
  { label: 'CATEGORY_SOCIAL', value: 'CATEGORY_SOCIAL' },
  { label: 'STARRED', value: 'STARRED' },
  { label: 'UNREAD', value: 'UNREAD' },
];

export class GmailAddLabel extends ServiceReactionDefinition {
  name = 'gmail.add_label';
  label = 'Add Label';
  description = 'Adds a label to an existing message (creates label if needed)';

  input_params: ParameterDefinition[] = [
    {
      name: 'message_id',
      type: ParameterType.STRING,
      label: 'Message ID',
      description: 'Gmail message id',
      required: true,
    },
    {
      name: 'label_name',
      type: ParameterType.SELECT,
      label: 'Label',
      description: 'Select a label to add (or one will be created)',
      required: true,
      options: LABEL_OPTIONS,
    },
  ];

  private async findOrCreateLabelId(token: string, labelValue: string) {
    const list = await axios.get<{
      labels?: Array<{ id: string; name: string }>;
    }>('https://gmail.googleapis.com/gmail/v1/users/me/labels', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const labels = (list.data.labels || []) as Array<{
      id: string;
      name: string;
    }>;
    // Try id first, then name
    const foundById = labels.find((l) => l.id === labelValue);
    if (foundById) return foundById.id;
    const foundByName = labels.find((l) => l.name === labelValue);
    if (foundByName) return foundByName.id;

    // create label (use the provided value as name)
    const createResp = await axios.post<{ id: string }>(
      'https://gmail.googleapis.com/gmail/v1/users/me/labels',
      {
        name: labelValue,
        labelListVisibility: 'labelShow',
        messageListVisibility: 'show',
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return createResp.data.id;
  }

  async execute(
    sconf: ServiceConfig,
    params: Record<string, ParameterValue>,
  ): Promise<void> {
    const token =
      (sconf?.config?.access_token as string | undefined) ||
      (sconf?.config?.google_access_token as string | undefined);

    const messageId = params.message_id?.value as string;
    const labelName = params.label_name?.value as string;

    if (!token) throw new Error('Missing Google access token');
    if (!messageId || !labelName)
      throw new Error('Missing parameters to add label');

    const labelId = await this.findOrCreateLabelId(token, labelName);

    try {
      await axios.post(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`,
        { addLabelIds: [labelId] },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Gmail API error: ${JSON.stringify(error.response?.data || error.message)}`,
        );
      }
      throw new Error(`Gmail API error: ${(error as Error).message}`);
    }
  }

  reload_cache(_sconf?: ServiceConfig): Promise<Record<string, any>> {
    return Promise.resolve({});
  }
}
