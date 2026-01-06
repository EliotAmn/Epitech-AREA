"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserJoinedServerAction = void 0;
const service_types_1 = require("../../../common/service.types");
const discord_client_1 = require("../discord.client");
class UserJoinedServerAction extends service_types_1.ServiceActionDefinition {
    name = 'user_joined_server';
    label = 'User Joined Server';
    poll_interval = 2;
    description = 'Triggers when a user joins the Discord server';
    output_params = [
        {
            name: 'username',
            type: service_types_1.ParameterType.STRING,
            label: 'Username',
            description: 'Username of the user who joined',
            required: true,
        },
        {
            name: 'user_id',
            type: service_types_1.ParameterType.STRING,
            label: 'User ID',
            description: 'Discord ID of the user',
            required: true,
        },
        {
            name: 'account_created_at',
            type: service_types_1.ParameterType.STRING,
            label: 'Account Creation Date',
            description: "When the user's account was created",
            required: true,
        },
        {
            name: 'joined_at',
            type: service_types_1.ParameterType.STRING,
            label: 'Joined At',
            description: 'When the user joined the server',
            required: true,
        },
    ];
    input_params = [
        {
            name: 'guild_id',
            type: service_types_1.ParameterType.STRING,
            label: 'Guild ID',
            description: 'The Discord server (guild) ID to monitor',
            required: true,
        },
    ];
    triggeredOutput = null;
    reload_cache(sconf) {
        const guildId = sconf.config.guild_id;
        if (!guildId) {
            throw new Error('guild_id is required in service config');
        }
        const manager = discord_client_1.DiscordClientManager.getInstance();
        const handlerId = `member_join_${guildId}_${Date.now()}`;
        manager.registerMemberJoinHandler(handlerId, (member) => {
            if (member.guild.id !== guildId)
                return;
            this.triggeredOutput = {
                triggered: true,
                parameters: {
                    username: {
                        type: service_types_1.ParameterType.STRING,
                        value: member.user.username,
                    },
                    user_id: {
                        type: service_types_1.ParameterType.STRING,
                        value: member.user.id,
                    },
                    account_created_at: {
                        type: service_types_1.ParameterType.STRING,
                        value: member.user.createdAt.toISOString(),
                    },
                    joined_at: {
                        type: service_types_1.ParameterType.STRING,
                        value: member.joinedAt?.toISOString() || new Date().toISOString(),
                    },
                },
            };
        });
        return Promise.resolve({
            guild_id: guildId,
            handler_id: handlerId,
        });
    }
    poll(_sconf) {
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
exports.UserJoinedServerAction = UserJoinedServerAction;
//# sourceMappingURL=user-joined-server.action.js.map