"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendDirectMessageReaction = void 0;
const service_types_1 = require("../../../common/service.types");
const discord_client_1 = require("../discord.client");
class SendDirectMessageReaction extends service_types_1.ServiceReactionDefinition {
    name = 'send_direct_message';
    description = 'Sends a direct message to a Discord user';
    input_params = [
        {
            name: 'user_id',
            type: service_types_1.ParameterType.STRING,
            label: 'User ID',
            description: 'The Discord ID of the user to send the DM to',
            required: true,
        },
        {
            name: 'message',
            type: service_types_1.ParameterType.STRING,
            label: 'Message',
            description: 'The message content to send',
            required: true,
        },
    ];
    async execute(sconf, params) {
        const userId = params.user_id?.value;
        const message = params.message?.value;
        if (!userId || !message) {
            throw new Error('Missing required parameters: user_id or message');
        }
        try {
            const client = (0, discord_client_1.getDiscordClient)();
            const user = await client.users.fetch(userId);
            if (!user) {
                throw new Error(`User with ID ${userId} not found`);
            }
            await user.send(message);
            console.log(`Successfully sent DM to user ${user.tag}`);
        }
        catch (error) {
            console.error(`Error sending DM to user ${userId}:`, error);
            throw error;
        }
    }
    async reload_cache(_sconf) {
        await Promise.resolve();
        return {};
    }
}
exports.SendDirectMessageReaction = SendDirectMessageReaction;
//# sourceMappingURL=send-direct-message.reaction.js.map