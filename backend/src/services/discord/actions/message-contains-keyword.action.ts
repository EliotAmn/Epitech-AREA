import { ParameterType, ServiceActionDefinition } from '@/common/service.types';
import type {
  ActionTriggerOutput,
  ParameterDefinition,
  ServiceConfig,
} from '@/common/service.types';
import { DiscordClientManager } from '../discord.client';

export class MessageContainsKeywordAction extends ServiceActionDefinition {
  name = 'message_contains_keyword';
  label = 'Message Contains Keyword';
  description = 'Triggers when a message contains a specific keyword';
  poll_interval = 2;
  output_params: ParameterDefinition[] = [
    {
      name: 'message_content',
      type: ParameterType.STRING,
      label: 'Message Content',
      description: 'The full content of the message',
      required: true,
    },
    {
      name: 'author',
      type: ParameterType.STRING,
      label: 'Author',
      description: 'Username of the message author',
      required: true,
    },
    {
      name: 'keyword_found',
      type: ParameterType.STRING,
      label: 'Keyword Found',
      description: 'The keyword that was detected',
      required: true,
    },
    {
      name: 'channel_name',
      type: ParameterType.STRING,
      label: 'Channel Name',
      description: 'Name of the channel where the message was sent',
      required: true,
    },
    {
      name: 'channel_id',
      type: ParameterType.STRING,
      label: 'Channel ID',
      description: 'ID of the channel where the message was sent',
      required: true,
    },
  ];

  input_params: ParameterDefinition[] = [
    {
      name: 'keyword',
      type: ParameterType.STRING,
      label: 'Keyword',
      description: 'Keyword to detect in messages',
      required: true,
    },
    {
      name: 'channel_id',
      type: ParameterType.STRING,
      label: 'Channel ID (optional)',
      description: 'If provided, only monitor this channel',
      required: false,
    },
  ];

  private lastMessageId: string | null = null;
  private triggeredOutput: ActionTriggerOutput | null = null;

  reload_cache(sconf: ServiceConfig): Promise<Record<string, unknown>> {
    const keyword = sconf?.config?.keyword ? String(sconf.config.keyword) : '';
    const channelId = sconf?.config?.channel_id
      ? String(sconf.config.channel_id)
      : undefined;

    if (!keyword) {
      console.warn(
        'MessageContainsKeywordAction.reload_cache: missing required config `keyword`; skipping handler registration.',
      );
      return Promise.resolve({
        keyword: null,
        channel_id: null,
        handler_id: null,
      });
    }

    const manager = DiscordClientManager.getInstance();
    const handlerId = `keyword_${keyword}_${Date.now()}`;

    manager.registerMessageHandler(handlerId, (message) => {
      if (channelId && message.channelId !== channelId) return;

      if (this.lastMessageId === message.id) return;

      const messageContent = String(message.content || '').toLowerCase();
      const keywordLower = keyword.toLowerCase();

      if (!messageContent.includes(keywordLower)) return;

      this.lastMessageId = message.id;
      this.triggeredOutput = {
        triggered: true,
        parameters: {
          message_content: {
            type: ParameterType.STRING,
            value: message.content,
          },
          author: {
            type: ParameterType.STRING,
            value: message.author.username,
          },
          keyword_found: {
            type: ParameterType.STRING,
            value: keyword,
          },
          channel_name: {
            type: ParameterType.STRING,
            value: (message.channel as { name?: string }).name || 'unknown',
          },
          channel_id: {
            type: ParameterType.STRING,
            value: message.channelId,
          },
        },
      };
    });

    return Promise.resolve({
      last_message_id: this.lastMessageId,
      keyword: keyword,
      channel_id: channelId || null,
      handler_id: handlerId,
    });
  }

  poll(_sconf: ServiceConfig): Promise<ActionTriggerOutput> {
    if (this.triggeredOutput) {
      const output = this.triggeredOutput;
      this.triggeredOutput = null;
      return Promise.resolve(output);
    }
    return Promise.resolve({
      triggered: false,
      parameters: {},
    });
  }
}
