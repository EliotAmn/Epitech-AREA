import {
  ActionTriggerOutput,
  ParameterDefinition,
  ParameterType,
  ServiceActionDefinition,
  ServiceConfig,
} from '@/common/service.types';
import { DiscordClientManager } from '../discord.client';

export class NewMessageInChannelAction extends ServiceActionDefinition {
  name = 'discord.new_message_in_channel';
  label = 'New Message in Channel';
  poll_interval = 2;
  description = 'Triggers when a new message is posted in a specific channel';
  output_params: ParameterDefinition[] = [
    {
      name: 'message_content',
      type: ParameterType.STRING,
      label: 'Message Content',
      description: 'The content of the message',
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
      name: 'channel_name',
      type: ParameterType.STRING,
      label: 'Channel Name',
      description: 'Name of the channel',
      required: true,
    },
    {
      name: 'timestamp',
      type: ParameterType.STRING,
      label: 'Timestamp',
      description: 'When the message was sent',
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
      name: 'channel_id',
      type: ParameterType.STRING,
      label: 'Channel ID',
      description: 'ID of the channel to monitor',
      required: true,
    },
  ];

  private lastMessageId: string | null = null;
  private triggeredOutput: ActionTriggerOutput | null = null;

  async reload_cache(sconf: ServiceConfig): Promise<Record<string, any>> {
    const channelId = sconf?.config?.channel_id
      ? String(sconf.config.channel_id as string)
      : undefined;

    if (!channelId) {
      console.warn(
        'NewMessageInChannelAction.reload_cache: missing required config `channel_id`; skipping handler registration.',
      );
      return Promise.resolve({
        channel_id: null,
        handler_id: null,
        last_message_id: null,
      });
    }

    const manager = DiscordClientManager.getInstance();
    const handlerId = `new_message_${channelId}_${Date.now()}`;

    manager.registerMessageHandler(handlerId, (message) => {
      if (message.channelId !== channelId) return;

      if (this.lastMessageId === message.id) return;

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
          channel_name: {
            type: ParameterType.STRING,
            value:
              message.channel && 'name' in message.channel
                ? message.channel.name
                : 'unknown',
          },
          channel_id: {
            type: ParameterType.STRING,
            value: message.channelId,
          },
          timestamp: {
            type: ParameterType.STRING,
            value: message.createdAt.toISOString(),
          },
        },
      };
    });

    return {
      last_message_id: this.lastMessageId,
      channel_id: channelId,
      handler_id: handlerId,
    };
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
