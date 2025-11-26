import { Injectable, Logger } from '@nestjs/common';

import { DiscordWebhookService } from './discord-webhook.service';

@Injectable()
export class DiscordListenerService {
  private readonly logger = new Logger(DiscordListenerService.name);

  constructor(private readonly discord: DiscordWebhookService) {}

  /**
   * Process a raw incoming message and evaluate the `message_contains` action.
   * If the action matches, run the reaction (for demo we call sendMessage).
   */
  async processMessage(
    message: string,
    params: { substring: string; caseSensitive?: boolean },
  ) {
    this.logger.log(
      `Processing incoming message for substring=${params.substring}`,
    );

    const matched = this.checkMessageContains(message, params.substring, {
      caseSensitive: params.caseSensitive,
    });

    if (!matched) {
      this.logger.log('No match — nothing to do.');
      return { matched: false };
    }

    const reactionResult = await this.discord.sendMessage(
      `🔔 Triggered reaction: found "${params.substring}" in message.`,
    );

    return { matched: true, reactionResult };
  }

  private checkMessageContains(
    message: string,
    substring: string,
    options: { caseSensitive?: boolean } = {},
  ): boolean {
    const { caseSensitive = false } = options;
    const normalizedMessage = caseSensitive ? message : message.toLowerCase();
    const normalizedSubstring = caseSensitive
      ? substring
      : substring.toLowerCase();

    return normalizedMessage.includes(normalizedSubstring);
  }
}

export default DiscordListenerService;
