"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewMessageInChannelAction = void 0;
const service_types_1 = require("../../../common/service.types");
const discord_client_1 = require("../discord.client");
class NewMessageInChannelAction extends service_types_1.ServiceActionDefinition {
    name = 'new_message_in_channel';
    label = 'New Message in Channel';
    description = 'Triggers when a new message is posted in a specific channel';
    output_params = [
        {
            name: 'message_content',
            type: service_types_1.ParameterType.STRING,
            label: 'Message Content',
            description: 'The content of the message',
            required: true,
        },
        {
            name: 'author',
            type: service_types_1.ParameterType.STRING,
            label: 'Author',
            description: 'Username of the message author',
            required: true,
        },
        {
            name: 'channel_name',
            type: service_types_1.ParameterType.STRING,
            label: 'Channel Name',
            description: 'Name of the channel',
            required: true,
        },
        {
            name: 'timestamp',
            type: service_types_1.ParameterType.STRING,
            label: 'Timestamp',
            description: 'When the message was sent',
            required: true,
        },
        {
            name: 'channel_id',
            type: service_types_1.ParameterType.STRING,
            label: 'Channel ID',
            description: 'ID of the channel where the message was sent',
            required: true,
        },
    ];
    input_params = [
        {
            name: 'channel_id',
            type: service_types_1.ParameterType.STRING,
            label: 'Channel ID',
            description: 'ID of the channel to monitor',
            required: true,
        },
    ];
    lastMessageId = null;
    triggeredOutput = null;
    async reload_cache(sconf) {
        const channelId = sconf?.config?.channel_id
            ? String(sconf.config.channel_id)
            : undefined;
        if (!channelId) {
            console.warn('NewMessageInChannelAction.reload_cache: missing required config `channel_id`; skipping handler registration.');
            return Promise.resolve({
                channel_id: null,
                handler_id: null,
                last_message_id: null,
            });
        }
        const manager = discord_client_1.DiscordClientManager.getInstance();
        const handlerId = `new_message_${channelId}_${Date.now()}`;
        manager.registerMessageHandler(handlerId, (message) => {
            if (message.channelId !== channelId)
                return;
            if (this.lastMessageId === message.id)
                return;
            this.lastMessageId = message.id;
            this.triggeredOutput = {
                triggered: true,
                parameters: {
                    message_content: {
                        type: service_types_1.ParameterType.STRING,
                        value: message.content,
                    },
                    author: {
                        type: service_types_1.ParameterType.STRING,
                        value: message.author.username,
                    },
                    channel_name: {
                        type: service_types_1.ParameterType.STRING,
                        value: message.channel && 'name' in message.channel
                            ? message.channel.name
                            : 'unknown',
                    },
                    channel_id: {
                        type: service_types_1.ParameterType.STRING,
                        value: message.channelId,
                    },
                    timestamp: {
                        type: service_types_1.ParameterType.STRING,
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
exports.NewMessageInChannelAction = NewMessageInChannelAction;
//# sourceMappingURL=new-message-in-channel.action.js.map