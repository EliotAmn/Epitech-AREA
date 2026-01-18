import { Logger } from '@nestjs/common';
import axios from 'axios';

import { ParameterType, ServiceActionDefinition } from '@/common/service.types';
import type {
  ActionTriggerOutput,
  ParameterDefinition,
  ServiceConfig,
} from '@/common/service.types';

interface GmailListResponse {
  messages?: Array<{ id: string; threadId?: string }>;
}

interface GmailMessageDetail {
  id?: string;
  threadId?: string;
  snippet?: string;
  payload?: { headers?: Array<{ name?: string; value?: string }> };
}

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

export class GmailEmailLabeled extends ServiceActionDefinition {
  name = 'gmail.email_labeled';
  label = 'Email Labeled';
  description =
    'Triggers when a new email with the specified label is received';
  poll_interval = 60;
  private readonly logger = new Logger(GmailEmailLabeled.name);

  input_params: ParameterDefinition[] = [
    {
      name: 'label',
      type: ParameterType.SELECT,
      label: 'Label',
      description: 'Select a Gmail label to watch',
      required: true,
      options: LABEL_OPTIONS,
    },
  ];

  output_params: ParameterDefinition[] = [
    {
      name: 'email_subject',
      type: ParameterType.STRING,
      label: 'Subject',
      description: 'The subject of the email',
      required: true,
    },
    {
      name: 'email_from',
      type: ParameterType.STRING,
      label: 'From',
      description: 'Sender of the email',
      required: true,
    },
    {
      name: 'message_id',
      type: ParameterType.STRING,
      label: 'Message ID',
      description: 'Message ID of the email',
      required: true,
    },
  ];

  private async getLabelId(accessToken: string, labelValue: string) {
    const resp = await axios.get<{
      labels?: Array<{ id: string; name: string }>;
    }>('https://gmail.googleapis.com/gmail/v1/users/me/labels', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const labels = resp.data?.labels || [];
    // Try to match by id first, then by name
    const found = labels.find(
      (l) => l.id === labelValue || l.name === labelValue,
    );
    return found?.id;
  }

  async reload_cache(sconf: ServiceConfig): Promise<Record<string, unknown>> {
    const accessToken =
      (sconf?.config?.access_token as string | undefined) ||
      (sconf?.config?.google_access_token as string | undefined);
    const labelName = sconf.config.label as string | undefined;

    if (!accessToken || !labelName) return { lastMessageId: null };

    try {
      const labelId = await this.getLabelId(accessToken, labelName);
      if (!labelId) return { lastMessageId: null };

      const resp = await axios.get<GmailListResponse>(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { labelIds: labelId, maxResults: 1 },
        },
      );

      const messages = resp.data?.messages;
      if (messages && messages.length > 0) {
        return { lastMessageId: messages[0].id };
      }
    } catch (err) {
      this.logger.warn(
        'reload_cache error:',
        err instanceof Error ? err.message : err,
      );
    }
    return { lastMessageId: null };
  }

  async poll(sconf: ServiceConfig): Promise<ActionTriggerOutput> {
    const accessToken =
      (sconf?.config?.access_token as string | undefined) ||
      (sconf?.config?.google_access_token as string | undefined);
    const labelName = sconf.config.label as string | undefined;

    if (!accessToken || !labelName) {
      this.logger.debug('poll: no access token or label name, skipping');
      return { triggered: false, parameters: {} };
    }

    const lastMessageId = sconf.cache?.lastMessageId as string | null;

    try {
      const labelId = await this.getLabelId(accessToken, labelName);
      if (!labelId) {
        this.logger.debug(`Label ${labelName} not found`);
        return { triggered: false, parameters: {} };
      }

      const resp = await axios.get<GmailListResponse>(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { labelIds: labelId, maxResults: 1 },
        },
      );

      const messages = resp.data?.messages;
      if (!messages || messages.length === 0) {
        this.logger.debug('poll: no messages for label');
        return { triggered: false, parameters: {} };
      }

      const latest = messages[0];
      if (lastMessageId === latest.id) {
        return { triggered: false, parameters: {} };
      }

      if (!lastMessageId) {
        this.logger.debug('poll: first run, priming cache only for label');
        return {
          triggered: false,
          parameters: {},
          cache: { lastMessageId: latest.id },
        };
      }

      // Fetch message headers
      const msgResp = await axios.get<GmailMessageDetail>(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${latest.id}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { format: 'full' },
        },
      );

      const msg = msgResp.data;
      const headers: Array<{ name?: string; value?: string }> =
        msg?.payload?.headers || [];
      const findHeader = (name: string) =>
        headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())
          ?.value || '';
      const subject = findHeader('Subject') || '';
      const from = findHeader('From') || '';

      this.logger.log(
        `GmailEmailLabeled triggered: label="${labelName}" from="${from}" subject="${subject}"`,
      );

      return {
        triggered: true,
        parameters: {
          email_subject: { type: ParameterType.STRING, value: subject },
          email_from: { type: ParameterType.STRING, value: from },
          message_id: { type: ParameterType.STRING, value: latest.id },
        },
        cache: { lastMessageId: latest.id },
      };
    } catch (err) {
      this.logger.error(
        'poll error: ' + (err instanceof Error ? err.message : String(err)),
      );
      return { triggered: false, parameters: {} };
    }
  }
}
