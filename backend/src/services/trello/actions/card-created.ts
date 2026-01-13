import { Logger } from '@nestjs/common';
import axios from 'axios';

import { ParameterType, ServiceActionDefinition } from '@/common/service.types';
import type {
  ActionTriggerOutput,
  ParameterDefinition,
  ServiceConfig,
} from '@/common/service.types';

interface TrelloCard {
  id: string;
  name: string;
  desc: string;
  idList: string;
  idBoard: string;
  dateLastActivity: string;
  url: string;
}

interface TrelloList {
  id: string;
  name: string;
  idBoard: string;
}

const logger = new Logger('TrelloService');

export class CardCreated extends ServiceActionDefinition {
  name = 'trello.card_created';
  label = 'On card created';
  description = 'Triggered when a new card is created on a board';
  poll_interval = 15;
  output_params: ParameterDefinition[] = [
    {
      name: 'card_name',
      type: ParameterType.STRING,
      label: 'Card Name',
      description: 'The name of the created card',
      required: true,
    },
    {
      name: 'card_description',
      type: ParameterType.STRING,
      label: 'Card Description',
      description: 'The description of the created card',
      required: true,
    },
    {
      name: 'list_name',
      type: ParameterType.STRING,
      label: 'List Name',
      description: 'The name of the list where the card was created',
      required: true,
    },
    {
      name: 'card_url',
      type: ParameterType.STRING,
      label: 'Card URL',
      description: 'The URL of the created card',
      required: true,
    },
  ];
  input_params: ParameterDefinition[] = [
    {
      name: 'board_id',
      type: ParameterType.STRING,
      label: 'Board ID',
      description:
        'The ID of the Trello board to monitor (find it in the board URL)',
      required: true,
    },
  ];

  reload_cache(): Promise<Record<string, unknown>> {
    return Promise.resolve({
      lastKnownCards: [] as string[],
      lists: {} as Record<string, string>,
    });
  }

  async poll(sconf: ServiceConfig): Promise<ActionTriggerOutput> {
    const accessToken = sconf.config.access_token as string | undefined;
    const boardId = sconf.config.board_id as string | undefined;
    const apiKey = process.env.TRELLO_API_KEY;

    logger.debug(
      `Polling for new cards, access token present: ${!!accessToken}`,
    );

    if (!accessToken || !apiKey) {
      logger.debug('No access token or API key, skipping poll');
      return { triggered: false, parameters: {} };
    }

    if (!boardId) {
      logger.debug('No board ID configured, skipping poll');
      return { triggered: false, parameters: {} };
    }

    const lastKnownCards = (sconf.cache?.lastKnownCards as string[]) || [];
    const cachedLists = (sconf.cache?.lists as Record<string, string>) || {};

    try {
      // Get all cards from the board
      const cardsResp = await axios.get<TrelloCard[]>(
        `https://api.trello.com/1/boards/${boardId}/cards`,
        {
          params: {
            key: apiKey,
            token: accessToken,
          },
        },
      );

      const currentCards = cardsResp.data;
      const currentCardIds = currentCards.map((card) => card.id);

      // Find new cards (cards that exist now but weren't in the cache)
      const newCards = currentCards.filter(
        (card) => !lastKnownCards.includes(card.id),
      );

      // If this is the first poll, just cache the cards
      if (lastKnownCards.length === 0) {
        logger.debug('First poll, caching existing cards');
        return {
          triggered: false,
          parameters: {},
          cache: { lastKnownCards: currentCardIds, lists: cachedLists },
        };
      }

      if (newCards.length > 0) {
        const newCard = newCards[0]; // Handle one card at a time
        logger.log(`New card detected: ${newCard.name}`);

        // Get list name
        let listName = cachedLists[newCard.idList];
        if (!listName) {
          try {
            const listResp = await axios.get<TrelloList>(
              `https://api.trello.com/1/lists/${newCard.idList}`,
              {
                params: {
                  key: apiKey,
                  token: accessToken,
                },
              },
            );
            listName = listResp.data.name;
            cachedLists[newCard.idList] = listName;
          } catch {
            listName = 'Unknown List';
          }
        }

        return {
          triggered: true,
          parameters: {
            card_name: { type: ParameterType.STRING, value: newCard.name },
            card_description: {
              type: ParameterType.STRING,
              value: newCard.desc || '',
            },
            list_name: { type: ParameterType.STRING, value: listName },
            card_url: { type: ParameterType.STRING, value: newCard.url },
          },
          cache: { lastKnownCards: currentCardIds, lists: cachedLists },
        };
      }

      return {
        triggered: false,
        parameters: {},
        cache: { lastKnownCards: currentCardIds, lists: cachedLists },
      };
    } catch (err: unknown) {
      const error = err as Error;
      logger.error(`Error polling Trello cards: ${error.message}`);
      return { triggered: false, parameters: {} };
    }
  }
}
