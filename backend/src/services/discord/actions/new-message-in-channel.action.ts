import { ParameterDefinition, ParameterType, ServiceActionDefinition, ActionTriggerOutput, ServiceConfig, ParameterValue } from "../../../common/service.types";
import { DiscordClientManager } from "../discord.client";

export class NewMessageInChannelAction extends ServiceActionDefinition {
    name = "new_message_in_channel";
    label = "New Message in Channel";
    description = "Triggers when a new message is posted in a specific channel";
    output_params: ParameterDefinition[] = [
        {
            name: "message_content",
            type: ParameterType.STRING,
            label: "Message Content",
            description: "The content of the message",
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
            name: "channel_name",
            type: ParameterType.STRING,
            label: "Channel Name",
            description: "Name of the channel",
            required: true,
        },
        {
            name: "timestamp",
            type: ParameterType.STRING,
            label: "Timestamp",
            description: "When the message was sent",
            required: true,
        }
    ];

    private lastMessageId: string | null = null;
    private triggeredOutput: ActionTriggerOutput | null = null;

    async reload_cache(sconf: ServiceConfig): Promise<Record<string, any>> {
        const channelId = sconf.config.channel_id;
        
        if (!channelId) {
            throw new Error("channel_id is required in service config");
        }

        // Register message handler
        const manager = DiscordClientManager.getInstance();
        const handlerId = `new_message_${channelId}_${Date.now()}`;
        
        manager.registerMessageHandler(handlerId, (message) => {
            // Only process messages from the specific channel
            if (message.channelId !== channelId) return;
            
            // Skip if we already processed this message
            if (this.lastMessageId === message.id) return;
            
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
                    channel_name: {
                        type: ParameterType.STRING,
                        value: message.channel && 'name' in message.channel ? message.channel.name : 'unknown',
                    },
                    timestamp: {
                        type: ParameterType.STRING,
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
