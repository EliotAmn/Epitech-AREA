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

interface TrelloCardResponse {
  id: string;
  name: string;
  desc: string;
  idList: string;
  url: string;
}

export class CreateCard extends ServiceReactionDefinition {
  name = 'trello.create_card';
  label = 'Create Card';
  description = 'Create a new card on a Trello list';
  input_params: ParameterDefinition[] = [
    {
      name: 'list_id',
      type: ParameterType.STRING,
      label: 'List ID',
      description:
        'The ID of the list to create the card in (find it in the list URL or use Trello API)',
      required: true,
    },
    {
      name: 'card_name',
      type: ParameterType.STRING,
      label: 'Card Name',
      description: 'The name of the new card',
      required: true,
    },
    {
      name: 'card_description',
      type: ParameterType.STRING,
      label: 'Card Description',
      description: 'The description of the new card (optional)',
      required: false,
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

    const listId = params.list_id?.value as string;
    const cardName = params.card_name?.value as string;
    const cardDescription = (params.card_description?.value as string) || '';

    if (!accessToken || !apiKey) {
      logger.error('No access token or API key available for Trello');
      throw new Error('No access token or API key available');
    }

    if (!listId || !cardName) {
      logger.error('List ID and card name are required');
      throw new Error('List ID and card name are required');
    }

    logger.debug(`Creating card "${cardName}" in list ${listId}`);

    try {
      const response = await axios.post<TrelloCardResponse>(
        'https://api.trello.com/1/cards',
        null,
        {
          params: {
            key: apiKey,
            token: accessToken,
            idList: listId,
            name: cardName,
            desc: cardDescription,
          },
        },
      );

      logger.log(
        `Card created successfully: ${response.data.name} (${response.data.id})`,
      );
    } catch (err: unknown) {
      const error = err as Error;
      logger.error(`Failed to create Trello card: ${error.message}`);
      throw new Error(`Failed to create Trello card: ${error.message}`);
    }
  }
}
