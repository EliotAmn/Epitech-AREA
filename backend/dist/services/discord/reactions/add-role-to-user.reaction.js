"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddRoleToUserReaction = void 0;
const service_types_1 = require("../../../common/service.types");
const discord_client_1 = require("../discord.client");
class AddRoleToUserReaction extends service_types_1.ServiceReactionDefinition {
    name = 'add_role_to_user';
    description = 'Adds a role to a specific Discord user';
    input_params = [
        {
            name: 'user_id',
            type: service_types_1.ParameterType.STRING,
            label: 'User ID',
            description: 'The Discord ID of the user',
            required: true,
        },
        {
            name: 'role_id',
            type: service_types_1.ParameterType.STRING,
            label: 'Role ID',
            description: 'The ID of the role to add',
            required: true,
        },
        {
            name: 'guild_id',
            type: service_types_1.ParameterType.STRING,
            label: 'Server ID',
            description: 'The Discord server (guild) ID',
            required: true,
        },
    ];
    async execute(sconf, params) {
        const userId = params.user_id?.value;
        const roleId = params.role_id?.value;
        const guildId = params.guild_id?.value;
        if (!userId || !roleId || !guildId) {
            throw new Error('Missing required parameters: user_id, role_id, or guild_id');
        }
        try {
            const client = (0, discord_client_1.getDiscordClient)();
            const guild = await client.guilds.fetch(guildId);
            if (!guild) {
                throw new Error(`Guild with ID ${guildId} not found`);
            }
            const member = await guild.members.fetch(userId);
            if (!member) {
                throw new Error(`Member with ID ${userId} not found in guild ${guildId}`);
            }
            const role = await guild.roles.fetch(roleId);
            if (!role) {
                throw new Error(`Role with ID ${roleId} not found in guild ${guildId}`);
            }
            await member.roles.add(role);
            console.log(`Successfully added role ${role.name} to user ${member.user.tag}`);
        }
        catch (error) {
            console.error(`Error adding role ${roleId} to user ${userId}:`, error);
            throw error;
        }
    }
    async reload_cache(_sconf) {
        await Promise.resolve();
        return {};
    }
}
exports.AddRoleToUserReaction = AddRoleToUserReaction;
//# sourceMappingURL=add-role-to-user.reaction.js.map