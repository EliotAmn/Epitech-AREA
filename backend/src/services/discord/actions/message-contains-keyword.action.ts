import { ParameterDefinition, ParameterType, ServiceActionDefinition, ActionTriggerOutput, ServiceConfig } from "../../../common/service.types";
import { DiscordClientManager } from "../discord.client";

export class MessageContainsKeywordAction extends ServiceActionDefinition {
    name = "message_contains_keyword";
    label = "Message Contains Keyword";
    description = "Triggers when a message contains a specific keyword";
    output_params: ParameterDefinition[] = [
        {
            name: "message_content",
            type: ParameterType.STRING,
            label: "Message Content",
            description: "The full content of the message",
            required: true,
        },
        {
            name: "author",
            type: ParameterType.STRING,
            label: "Author",
            description: "Username of the message author",
            required: true,
        },
        {
            name: "keyword_found",
            type: ParameterType.STRING,
            label: "Keyword Found",
            description: "The keyword that was detected",
            required: true,
        },
        {
            name: "channel_name",
            type: ParameterType.STRING,
            label: "Channel Name",
            description: "Name of the channel where the message was sent",
            required: true,
        }
    ];

    private lastMessageId: string | null = null;
    private triggeredOutput: ActionTriggerOutput | null = null;

    async reload_cache(sconf: ServiceConfig): Promise<Record<string, any>> {
        const keyword = sconf.config.keyword;
        const channelId = sconf.config.channel_id;
        
        if (!keyword) {
            throw new Error("keyword is required in service config");
        }

        // Register message handler
        const manager = DiscordClientManager.getInstance();
        const handlerId = `keyword_${keyword}_${Date.now()}`;
        
        manager.registerMessageHandler(handlerId, (message) => {
            // If channelId is specified, only monitor that channel
            if (channelId && message.channelId !== channelId) return;
            
            // Skip if we already processed this message
            if (this.lastMessageId === message.id) return;
            
            // Check if message contains the keyword (case-insensitive)
            const messageContent = message.content.toLowerCase();
            const keywordLower = keyword.toLowerCase();
            
            if (!messageContent.includes(keywordLower)) return;
            
            this.lastMessageId = message.id;
            this.triggeredOutput = {
                triggered: true,
                parameters: {
                    message_content: {
                        type: ParameterType.STRING,
                        value: message.content,
                    },
                    author: {
                        type: ParameterType.STRING,
                        value: message.author.username,
                    },
                    keyword_found: {
                        type: ParameterType.STRING,
                        value: keyword,
                    },
                    channel_name: {
                        type: ParameterType.STRING,
                        value: message.channel && 'name' in message.channel ? message.channel.name : 'unknown',
                    },
                },
            };
        });

        return {
            last_message_id: this.lastMessageId,
            keyword: keyword,
            channel_id: channelId || null,
            handler_id: handlerId,
        };
    }

    async poll(sconf: ServiceConfig): Promise<ActionTriggerOutput> {
        // Check if we have a triggered output from the message handler
        if (this.triggeredOutput) {
            const output = this.triggeredOutput;
            this.triggeredOutput = null; // Reset after returning
            return output;
        }
        
        return {
            triggered: false,
            parameters: {},
        };
    }
}
