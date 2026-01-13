import { Logger } from '@nestjs/common';
import axios from 'axios';

import {
  ParameterType,
  ServiceReactionDefinition,
} from '@/common/service.types';
import type {
  ParameterDefinition,
  ParameterValue,
  ServiceConfig,
} from '@/common/service.types';

const logger = new Logger('TrelloService');

interface TrelloCommentResponse {
  id: string;
  data: {
    text: string;
  };
  date: string;
}

export class AddComment extends ServiceReactionDefinition {
  name = 'trello.add_comment';
  label = 'Add Comment';
  description = 'Add a comment to a Trello card';
  input_params: ParameterDefinition[] = [
    {
      name: 'card_id',
      type: ParameterType.STRING,
      label: 'Card ID',
      description:
        'The ID of the card to add a comment to (find it in the card URL)',
      required: true,
    },
    {
      name: 'comment_text',
      type: ParameterType.STRING,
      label: 'Comment Text',
      description: 'The text of the comment to add',
      required: true,
    },
  ];

  reload_cache(): Promise<Record<string, unknown>> {
    return Promise.resolve({});
  }

  async execute(
    sconf: ServiceConfig,
    params: Record<string, ParameterValue>,
  ): Promise<void> {
    const accessToken = sconf.config.access_token as string | undefined;
    const apiKey = process.env.TRELLO_API_KEY;

    const cardId = params.card_id?.value as string;
    const commentText = params.comment_text?.value as string;

    if (!accessToken || !apiKey) {
      logger.error('No access token or API key available for Trello');
      throw new Error('No access token or API key available');
    }

    if (!cardId || !commentText) {
      logger.error('Card ID and comment text are required');
      throw new Error('Card ID and comment text are required');
    }

    logger.debug(`Adding comment to card ${cardId}`);

    try {
      const response = await axios.post<TrelloCommentResponse>(
        `https://api.trello.com/1/cards/${cardId}/actions/comments`,
        null,
        {
          params: {
            key: apiKey,
            token: accessToken,
            text: commentText,
          },
        },
      );

      logger.log(
        `Comment added successfully to card ${cardId}: ${response.data.id}`,
      );
    } catch (err: unknown) {
      const error = err as Error;
      logger.error(`Failed to add comment to Trello card: ${error.message}`);
      throw new Error(`Failed to add comment to Trello card: ${error.message}`);
    }
  }
}
