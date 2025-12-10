/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  ActionTriggerOutput,
  ParameterDefinition,
  ParameterType,
  ServiceActionDefinition,
  ServiceConfig,
} from '@/common/service.types';
import { DiscordClientManager } from '../discord.client';

export class UserJoinedServerAction extends ServiceActionDefinition {
  name = 'user_joined_server';
  label = 'User Joined Server';
  description = 'Triggers when a user joins the Discord server';
  output_params: ParameterDefinition[] = [
    {
      name: 'username',
      type: ParameterType.STRING,
      label: 'Username',
      description: 'Username of the user who joined',
      required: true,
    },
    {
      name: 'user_id',
      type: ParameterType.STRING,
      label: 'User ID',
      description: 'Discord ID of the user',
      required: true,
    },
    {
      name: 'account_created_at',
      type: ParameterType.STRING,
      label: 'Account Creation Date',
      description: "When the user's account was created",
      required: true,
    },
    {
      name: 'joined_at',
      type: ParameterType.STRING,
      label: 'Joined At',
      description: 'When the user joined the server',
      required: true,
    },
  ];

  input_params: ParameterDefinition[] = [
    {
      name: 'guild_id',
      type: ParameterType.STRING,
      label: 'Guild ID',
      description: 'The Discord server (guild) ID to monitor',
      required: true,
    },
  ];

  private triggeredOutput: ActionTriggerOutput | null = null;

  reload_cache(sconf: ServiceConfig): Promise<Record<string, any>> {
    const guildId = sconf.config.guild_id;

    if (!guildId) {
      throw new Error('guild_id is required in service config');
    }

    const manager = DiscordClientManager.getInstance();
    const handlerId = `member_join_${guildId}_${Date.now()}`;

    manager.registerMemberJoinHandler(handlerId, (member) => {
      if (member.guild.id !== guildId) return;

      this.triggeredOutput = {
        triggered: true,
        parameters: {
          username: {
            type: ParameterType.STRING,
            value: member.user.username,
          },
          user_id: {
            type: ParameterType.STRING,
            value: member.user.id,
          },
          account_created_at: {
            type: ParameterType.STRING,
            value: member.user.createdAt.toISOString(),
          },
          joined_at: {
            type: ParameterType.STRING,
            value: member.joinedAt?.toISOString() || new Date().toISOString(),
          },
        },
      };
    });

    return {
      guild_id: guildId,
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
