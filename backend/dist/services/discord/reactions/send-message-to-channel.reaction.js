"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendMessageToChannelReaction = void 0;
const discord_js_1 = require("discord.js");
const service_types_1 = require("../../../common/service.types");
const discord_client_1 = require("../discord.client");
class SendMessageToChannelReaction extends service_types_1.ServiceReactionDefinition {
    name = 'send_message_to_channel';
    description = 'Sends a message to a specific Discord channel';
    input_params = [
        {
            name: 'channel_id',
            type: service_types_1.ParameterType.STRING,
            label: 'Channel ID',
            description: 'The ID of the channel to send the message to',
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
        const channelId = params.channel_id?.value && typeof params.channel_id.value === 'string'
            ? params.channel_id.value
            : null;
        const message = params.message?.value && typeof params.message.value === 'string'
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
            const client = (0, discord_client_1.getDiscordClient)();
            const channel = await client.channels.fetch(channelId);
            if (!channel) {
                console.error(`Channel with ID ${channelId} not found`);
                throw new Error(`Channel with ID ${channelId} not found`);
            }
            if (channel.type !== discord_js_1.ChannelType.GuildText) {
                console.error(`Channel ${channelId} is not a text channel`);
                throw new Error(`Channel ${channelId} is not a text channel`);
            }
            const textChannel = channel;
            await textChannel.send(message);
        }
        catch (error) {
            console.error(`Error sending message to channel ${channelId}:`, error);
            throw error;
        }
    }
    async reload_cache(_sconf) {
        return Promise.resolve({});
    }
}
exports.SendMessageToChannelReaction = SendMessageToChannelReaction;
//# sourceMappingURL=send-message-to-channel.reaction.js.map