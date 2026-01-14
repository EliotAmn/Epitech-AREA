/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */

import {
  ParameterDefinition,
  ParameterType,
  ServiceConfig,
  ServiceReactionDefinition,
} from '@/common/service.types';
import { getDiscordClient } from '../discord.client';

export class SendDirectMessageReaction extends ServiceReactionDefinition {
  name = 'discord.send_direct_message';
  label = 'Send Direct Message';
  description = 'Sends a direct message to a Discord user';
  input_params: ParameterDefinition[] = [
    {
      name: 'user_id',
      type: ParameterType.STRING,
      label: 'User ID',
      description: 'The Discord ID of the user to send the DM to',
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
    params: Record<string, any>,
  ): Promise<void> {
    const userId = params.user_id?.value;
    const message = params.message?.value;

    if (!userId || !message) {
      throw new Error('Missing required parameters: user_id or message');
    }

    try {
      const client = getDiscordClient();
      const user = await client.users.fetch(userId);

      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      await user.send(message);

      console.log(`Successfully sent DM to user ${user.tag}`);
    } catch (error) {
      console.error(`Error sending DM to user ${userId}:`, error);
      throw error;
    }
  }

  async reload_cache(_sconf?: ServiceConfig): Promise<Record<string, any>> {
    await Promise.resolve();
    return {};
  }
}
