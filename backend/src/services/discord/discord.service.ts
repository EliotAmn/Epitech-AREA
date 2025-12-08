import {
  ParameterType,
  ServiceConfig,
  ServiceDefinition,
  ServiceReactionDefinition,
} from '@/common/service.types';

class DiscordCustomWebhookReaction extends ServiceReactionDefinition {
  name = 'custom_webhook';
  description = 'Send a message to a Discord channel via webhook';
  input_params = [
    {
      name: 'webhook_url',
      type: ParameterType.STRING,
      label: 'Webhook URL',
      description: 'The URL of the Discord webhook to send the message to',
      required: true,
    },
    {
      name: 'message',
      type: ParameterType.STRING,
      label: 'Message',
      description: 'The message to send to the Discord channel',
      required: true,
    },
  ];

  execute(sconf: ServiceConfig, params: Record<string, any>): Promise<void> {
    throw new Error('Method not implemented.');
  }
}

export default class DiscordService implements ServiceDefinition {
  name = 'discord';
  label = 'Discord';
  description = 'Interact with your discord servers';
  actions = [];
  reactions = [DiscordCustomWebhookReaction];
}
