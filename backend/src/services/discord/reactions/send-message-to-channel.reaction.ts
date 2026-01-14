import { ChannelType } from 'discord.js';

import {
  ParameterDefinition,
  ParameterType,
  ParameterValue,
  ServiceConfig,
  ServiceReactionDefinition,
} from '@/common/service.types';
import { getDiscordClient } from '../discord.client';

export class SendMessageToChannelReaction extends ServiceReactionDefinition {
  name = 'discord.send_message_to_channel';
  label = 'Send Message to Channel';
  description = 'Sends a message to a specific Discord channel';
  input_params: ParameterDefinition[] = [
    {
      name: 'channel_id',
      type: ParameterType.STRING,
      label: 'Channel ID',
      description: 'The ID of the channel to send the message to',
      required: true,
    },
    {
      name: 'message',
      type: ParameterType.STRING,
      label: 'Message',
      description: 'The message content to send',
      required: true,
    },
  ];

  async execute(
    sconf: ServiceConfig,
    params: Record<string, ParameterValue>,
  ): Promise<void> {
    const channelId =
      params.channel_id?.value && typeof params.channel_id.value === 'string'
        ? params.channel_id.value
        : null;
    const message =
      params.message?.value && typeof params.message.value === 'string'
        ? params.message.value
        : null;

    if (!channelId || !message) {
      console.error('Missing required parameters: channel_id or message', {
        channelId,
        message,
      });
      throw new Error('Missing required parameters: channel_id or message');
    }

    try {
      const client = getDiscordClient();
      const channel = await client.channels.fetch(channelId);

      if (!channel) {
        console.error(`Channel with ID ${channelId} not found`);
        throw new Error(`Channel with ID ${channelId} not found`);
      }

      if (channel.type !== ChannelType.GuildText) {
        console.error(`Channel ${channelId} is not a text channel`);
        throw new Error(`Channel ${channelId} is not a text channel`);
      }

      const textChannel = channel;
      await textChannel.send(message);
    } catch (error) {
      console.error(`Error sending message to channel ${channelId}:`, error);
      throw error;
    }
  }

  async reload_cache(_sconf?: ServiceConfig): Promise<Record<string, any>> {
    return Promise.resolve({});
  }
}
