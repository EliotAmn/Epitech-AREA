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
  id: string;
  threadId?: string;
  snippet?: string;
  payload?: { headers?: Array<{ name?: string; value?: string }> };
}

export class GmailEmailReceived extends ServiceActionDefinition {
  name = 'gmail.email_received';
  label = 'Email Received';
  description = 'Triggers when a new email is received in the Gmail inbox';
  poll_interval = 60;
  private readonly logger = new Logger(GmailEmailReceived.name);
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
      name: 'email_snippet',
      type: ParameterType.STRING,
      label: 'Snippet',
      description: 'A short snippet of the email body',
      required: false,
    },
    {
      name: 'message_id',
      type: ParameterType.STRING,
      label: 'Message ID',
      description: 'Gmail message id',
      required: true,
    },
    {
      name: 'thread_id',
      type: ParameterType.STRING,
      label: 'Thread ID',
      description: 'Gmail thread id',
      required: false,
    },
  ];

  async reload_cache(sconf: ServiceConfig): Promise<Record<string, unknown>> {
    const accessToken =
      (sconf?.config?.access_token as string | undefined) ||
      (sconf?.config?.google_access_token as string | undefined);

    if (!accessToken) return { lastMessageId: null };

    try {
      const resp = await axios.get<GmailListResponse>(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { labelIds: 'INBOX', maxResults: 1 },
        },
      );
      const messages = resp.data?.messages;
      if (messages && messages.length > 0) {
        return { lastMessageId: messages[0].id };
      }
    } catch (err) {
      console.warn(
        '[Gmail] reload_cache error:',
        err instanceof Error ? err.message : err,
      );
    }
    return { lastMessageId: null };
  }

  async poll(sconf: ServiceConfig): Promise<ActionTriggerOutput> {
    const accessToken =
      (sconf?.config?.access_token as string | undefined) ||
      (sconf?.config?.google_access_token as string | undefined);

    if (!accessToken) {
      this.logger.debug('poll: no access token, skipping');
      return { triggered: false, parameters: {} };
    }

    const lastMessageId = sconf.cache?.lastMessageId as string | null;

    try {
      const listResp = await axios.get<GmailListResponse>(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { labelIds: 'INBOX', maxResults: 1 },
        },
      );

      const messages = listResp.data?.messages;
      if (!messages || messages.length === 0) {
        this.logger.debug('poll: no messages in INBOX');
        return { triggered: false, parameters: {} };
      }

      const latest = messages[0];
      if (lastMessageId === latest.id) {
        this.logger.debug('poll: no new email since last check');
        return { triggered: false, parameters: {} };
      }

      if (!lastMessageId) {
        this.logger.debug('poll: first run, priming cache only');
        return {
          triggered: false,
          parameters: {},
          cache: { lastMessageId: latest.id },
        };
      }

      const msgResp = await axios.get<GmailMessageDetail>(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${latest.id}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { format: 'full' },
        },
      );

      const msg = msgResp.data;
      const headers: Array<{ name?: string; value?: string }> =
        msg.payload?.headers || [];
      const findHeader = (name: string) =>
        headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())
          ?.value || '';
      const subject = findHeader('Subject') || '';
      const from = findHeader('From') || '';
      const snippet = msg.snippet || '';

      this.logger.log(
        `GmailEmailReceived triggered: new email from="${from}" subject="${subject}"`,
      );

      return {
        triggered: true,
        parameters: {
          email_subject: { type: ParameterType.STRING, value: subject },
          email_from: { type: ParameterType.STRING, value: from },
          email_snippet: { type: ParameterType.STRING, value: snippet },
          message_id: { type: ParameterType.STRING, value: latest.id },
          thread_id: { type: ParameterType.STRING, value: msg.threadId || '' },
        },
        cache: { lastMessageId: latest.id },
      };
    } catch (err) {
      if (axios.isAxiosError(err)) {
        this.logger.error(
          `[Gmail] API error: ${JSON.stringify(
            err.response?.data || err.message,
          )}`,
        );
      } else {
        this.logger.error(
          '[Gmail] poll error: ' +
            (err instanceof Error ? err.message : String(err)),
        );
      }
      return { triggered: false, parameters: {} };
    }
  }
}
