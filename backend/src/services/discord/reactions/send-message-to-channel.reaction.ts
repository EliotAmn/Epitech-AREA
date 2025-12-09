import { ParameterDefinition, ParameterType, ServiceReactionDefinition, ServiceConfig } from "../../../common/service.types";
import { TextChannel, ChannelType } from "discord.js";
import { getDiscordClient } from "../discord.client";

export class SendMessageToChannelReaction extends ServiceReactionDefinition {
    name = "send_message_to_channel";
    description = "Sends a message to a specific Discord channel";
    input_params: ParameterDefinition[] = [
        {
            name: "channel_id",
            type: ParameterType.STRING,
            label: "Channel ID",
            description: "The ID of the channel to send the message to",
            required: true,
        },
        {
            name: "message",
            type: ParameterType.STRING,
            label: "Message",
            description: "The message content to send",
            required: true,
        }
    ];

    async execute(sconf: ServiceConfig, params: Record<string, any>): Promise<void> {
        const channelId = params.channel_id?.value;
        const message = params.message?.value;

        if (!channelId || !message) {
            throw new Error("Missing required parameters: channel_id or message");
        }

        try {
            const client = getDiscordClient();
            const channel = await client.channels.fetch(channelId);
            
            if (!channel) {
                throw new Error(`Channel with ID ${channelId} not found`);
            }

            if (channel.type !== ChannelType.GuildText) {
                throw new Error(`Channel ${channelId} is not a text channel`);
            }

            const textChannel = channel as TextChannel;
            await textChannel.send(message);
            
            console.log(`Successfully sent message to channel ${channelId}`);
        } catch (error) {
            console.error(`Error sending message to channel ${channelId}:`, error);
            throw error;
        }
    }
}
