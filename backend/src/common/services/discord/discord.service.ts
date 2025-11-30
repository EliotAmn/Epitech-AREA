import {
    ParamaterType,
    ServiceConfig,
    ServiceDefinition,
    ServiceReactionDefinition
} from "../../service.types";
import {Injectable} from "@nestjs/common";

class DiscordCustomWebhookReaction extends ServiceReactionDefinition {
    name = 'custom_webhook';
    description = 'Trigger when a custom webhook is called';
    input_params = [
        {
            name: 'webhook_url',
            type: ParamaterType.STRING,
            label: 'Webhook URL',
            description: 'The URL of the Discord webhook to send the message to',
            required: true,
        },
        {
            name: 'message',
            type: ParamaterType.STRING,
            label: 'Message',
            description: 'The message to send to the Discord channel',
            required: true,
        },
    ];

    execute(sconf: ServiceConfig<Record<string, any>>, params: Record<string, any>): Promise<void> {
        throw new Error("Method not implemented.");
    }
}


export default class DiscordService implements ServiceDefinition {
    name = 'discord';
    label = 'Discord';
    description = 'Interract with your discord servers'
    actions = [];
    reactions = [
        DiscordCustomWebhookReaction
    ]
}
