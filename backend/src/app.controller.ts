import { Body, Controller, Post } from '@nestjs/common';

import { DiscordListenerService } from './services/discord-listener.service';
import { DiscordWebhookService } from './services/discord-webhook.service';

@Controller('notify')
export class AppController {
  constructor(
    private readonly webhookService: DiscordWebhookService,
    private readonly listener: DiscordListenerService,
  ) {}

  @Post('new-event')
  async handleNewEvent(@Body() body: { eventName: string; data: string }) {
    const message = `🚨 **New Event Triggered!** 🚨\n\n**Event:** ${body.eventName}\n**Details:** ${body.data}`;

    // Call the service to send the message
    await this.webhookService.sendMessage(message);

    return { received: true, notification_sent: true };
  }

  @Post('simulate-message')
  async simulateMessage(
    @Body()
    body: {
      message: string;
      substring: string;
      caseSensitive?: boolean;
    },
  ) {
    // Pass the incoming message to the listener which evaluates actions and
    // triggers reactions for demonstration purposes.
    const result = await this.listener.processMessage(body.message, {
      substring: body.substring,
      caseSensitive: body.caseSensitive,
    });

    return { processed: true, result };
  }
}
