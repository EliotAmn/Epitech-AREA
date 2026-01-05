"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageContainsKeywordAction = void 0;
const service_types_1 = require("../../../common/service.types");
const discord_client_1 = require("../discord.client");
class MessageContainsKeywordAction extends service_types_1.ServiceActionDefinition {
    name = 'message_contains_keyword';
    label = 'Message Contains Keyword';
    description = 'Triggers when a message contains a specific keyword';
    output_params = [
        {
            name: 'message_content',
            type: service_types_1.ParameterType.STRING,
            label: 'Message Content',
            description: 'The full content of the message',
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
            name: 'keyword_found',
            type: service_types_1.ParameterType.STRING,
            label: 'Keyword Found',
            description: 'The keyword that was detected',
            required: true,
        },
        {
            name: 'channel_name',
            type: service_types_1.ParameterType.STRING,
            label: 'Channel Name',
            description: 'Name of the channel where the message was sent',
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
            name: 'keyword',
            type: service_types_1.ParameterType.STRING,
            label: 'Keyword',
            description: 'Keyword to detect in messages',
            required: true,
        },
        {
            name: 'channel_id',
            type: service_types_1.ParameterType.STRING,
            label: 'Channel ID (optional)',
            description: 'If provided, only monitor this channel',
            required: false,
        },
    ];
    lastMessageId = null;
    triggeredOutput = null;
    reload_cache(sconf) {
        const keyword = sconf?.config?.keyword ? String(sconf.config.keyword) : '';
        const channelId = sconf?.config?.channel_id
            ? String(sconf.config.channel_id)
            : undefined;
        if (!keyword) {
            console.warn('MessageContainsKeywordAction.reload_cache: missing required config `keyword`; skipping handler registration.');
            return Promise.resolve({
                keyword: null,
                channel_id: null,
                handler_id: null,
            });
        }
        const manager = discord_client_1.DiscordClientManager.getInstance();
        const handlerId = `keyword_${keyword}_${Date.now()}`;
        manager.registerMessageHandler(handlerId, (message) => {
            if (channelId && message.channelId !== channelId)
                return;
            if (this.lastMessageId === message.id)
                return;
            const messageContent = String(message.content || '').toLowerCase();
            const keywordLower = keyword.toLowerCase();
            if (!messageContent.includes(keywordLower))
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
                    keyword_found: {
                        type: service_types_1.ParameterType.STRING,
                        value: keyword,
                    },
                    channel_name: {
                        type: service_types_1.ParameterType.STRING,
                        value: message.channel.name || 'unknown',
                    },
                    channel_id: {
                        type: service_types_1.ParameterType.STRING,
                        value: message.channelId,
                    },
                },
            };
        });
        return Promise.resolve({
            last_message_id: this.lastMessageId,
            keyword: keyword,
            channel_id: channelId || null,
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
exports.MessageContainsKeywordAction = MessageContainsKeywordAction;
//# sourceMappingURL=message-contains-keyword.action.js.map