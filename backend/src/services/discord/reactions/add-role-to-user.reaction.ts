/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */

import {
  ParameterDefinition,
  ParameterType,
  ServiceConfig,
  ServiceReactionDefinition,
} from '@/common/service.types';
import { getDiscordClient } from '../discord.client';

export class AddRoleToUserReaction extends ServiceReactionDefinition {
  name = 'discord.add_role_to_user';
  label = 'Add Role to User';
  description = 'Adds a role to a specific Discord user';
  input_params: ParameterDefinition[] = [
    {
      name: 'user_id',
      type: ParameterType.STRING,
      label: 'User ID',
      description: 'The Discord ID of the user',
      required: true,
    },
    {
      name: 'role_id',
      type: ParameterType.STRING,
      label: 'Role ID',
      description: 'The ID of the role to add',
      required: true,
    },
    {
      name: 'guild_id',
      type: ParameterType.STRING,
      label: 'Server ID',
      description: 'The Discord server (guild) ID',
      required: true,
    },
  ];

  async execute(
    sconf: ServiceConfig,
    params: Record<string, any>,
  ): Promise<void> {
    const userId = params.user_id?.value;
    const roleId = params.role_id?.value;
    const guildId = params.guild_id?.value;

    if (!userId || !roleId || !guildId) {
      throw new Error(
        'Missing required parameters: user_id, role_id, or guild_id',
      );
    }

    try {
      const client = getDiscordClient();
      const guild = await client.guilds.fetch(guildId);

      if (!guild) {
        throw new Error(`Guild with ID ${guildId} not found`);
      }

      const member = await guild.members.fetch(userId);

      if (!member) {
        throw new Error(
          `Member with ID ${userId} not found in guild ${guildId}`,
        );
      }

      const role = await guild.roles.fetch(roleId);

      if (!role) {
        throw new Error(`Role with ID ${roleId} not found in guild ${guildId}`);
      }

      await member.roles.add(role);

      console.log(
        `Successfully added role ${role.name} to user ${member.user.tag}`,
      );
    } catch (error) {
      console.error(`Error adding role ${roleId} to user ${userId}:`, error);
      throw error;
    }
  }

  async reload_cache(_sconf?: ServiceConfig): Promise<Record<string, any>> {
    await Promise.resolve();
    return {};
  }
}
