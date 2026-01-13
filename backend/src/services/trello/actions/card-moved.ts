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

interface CardListCache {
  cardId: string;
  listId: string;
}

const logger = new Logger('TrelloService');

export class CardMoved extends ServiceActionDefinition {
  name = 'trello.card_moved';
  label = 'On card moved';
  description = 'Triggered when a card is moved to a different list';
  poll_interval = 15;
  output_params: ParameterDefinition[] = [
    {
      name: 'card_name',
      type: ParameterType.STRING,
      label: 'Card Name',
      description: 'The name of the moved card',
      required: true,
    },
    {
      name: 'from_list',
      type: ParameterType.STRING,
      label: 'From List',
      description: 'The name of the list the card was moved from',
      required: true,
    },
    {
      name: 'to_list',
      type: ParameterType.STRING,
      label: 'To List',
      description: 'The name of the list the card was moved to',
      required: true,
    },
    {
      name: 'card_url',
      type: ParameterType.STRING,
      label: 'Card URL',
      description: 'The URL of the moved card',
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
      cardLists: [] as CardListCache[],
      lists: {} as Record<string, string>,
    });
  }

  async poll(sconf: ServiceConfig): Promise<ActionTriggerOutput> {
    const accessToken = sconf.config.access_token as string | undefined;
    const boardId = sconf.config.board_id as string | undefined;
    const apiKey = process.env.TRELLO_API_KEY;

    logger.debug(
      `Polling for card moves, access token present: ${!!accessToken}`,
    );

    if (!accessToken || !apiKey) {
      logger.debug('No access token or API key, skipping poll');
      return { triggered: false, parameters: {} };
    }

    if (!boardId) {
      logger.debug('No board ID configured, skipping poll');
      return { triggered: false, parameters: {} };
    }

    const cardLists = (sconf.cache?.cardLists as CardListCache[]) || [];
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
      const currentCardLists: CardListCache[] = currentCards.map((card) => ({
        cardId: card.id,
        listId: card.idList,
      }));

      // If this is the first poll, just cache the card positions
      if (cardLists.length === 0) {
        logger.debug('First poll, caching card positions');
        return {
          triggered: false,
          parameters: {},
          cache: { cardLists: currentCardLists, lists: cachedLists },
        };
      }

      // Find cards that moved (same card ID but different list ID)
      for (const currentCard of currentCards) {
        const previousState = cardLists.find(
          (cl) => cl.cardId === currentCard.id,
        );

        if (previousState && previousState.listId !== currentCard.idList) {
          logger.log(`Card moved detected: ${currentCard.name}`);

          // Get list names
          let fromListName = cachedLists[previousState.listId];
          let toListName = cachedLists[currentCard.idList];

          if (!fromListName) {
            try {
              const listResp = await axios.get<TrelloList>(
                `https://api.trello.com/1/lists/${previousState.listId}`,
                {
                  params: {
                    key: apiKey,
                    token: accessToken,
                  },
                },
              );
              fromListName = listResp.data.name;
              cachedLists[previousState.listId] = fromListName;
            } catch {
              fromListName = 'Unknown List';
            }
          }

          if (!toListName) {
            try {
              const listResp = await axios.get<TrelloList>(
                `https://api.trello.com/1/lists/${currentCard.idList}`,
                {
                  params: {
                    key: apiKey,
                    token: accessToken,
                  },
                },
              );
              toListName = listResp.data.name;
              cachedLists[currentCard.idList] = toListName;
            } catch {
              toListName = 'Unknown List';
            }
          }

          return {
            triggered: true,
            parameters: {
              card_name: {
                type: ParameterType.STRING,
                value: currentCard.name,
              },
              from_list: { type: ParameterType.STRING, value: fromListName },
              to_list: { type: ParameterType.STRING, value: toListName },
              card_url: { type: ParameterType.STRING, value: currentCard.url },
            },
            cache: { cardLists: currentCardLists, lists: cachedLists },
          };
        }
      }

      return {
        triggered: false,
        parameters: {},
        cache: { cardLists: currentCardLists, lists: cachedLists },
      };
    } catch (err: unknown) {
      const error = err as Error;
      logger.error(`Error polling Trello card moves: ${error.message}`);
      return { triggered: false, parameters: {} };
    }
  }
}
