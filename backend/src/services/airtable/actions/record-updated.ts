import { Logger } from '@nestjs/common';
import axios from 'axios';

import { ParameterType, ServiceActionDefinition } from '@/common/service.types';
import type {
  ActionTriggerOutput,
  ParameterDefinition,
  ServiceConfig,
} from '@/common/service.types';

interface AirtableRecord {
  id: string;
  createdTime: string;
  fields: Record<string, any>;
}

interface AirtableListResponse {
  records: AirtableRecord[];
  offset?: string;
}

const logger = new Logger('AirtableService');

export class RecordUpdated extends ServiceActionDefinition {
  name = 'airtable.record_updated';
  label = 'On record updated';
  description = 'Triggered when a record is modified in a table';
  poll_interval = 10; // Check every 10 seconds
  output_params: ParameterDefinition[] = [
    {
      name: 'record_id',
      type: ParameterType.STRING,
      label: 'Record ID',
      description: 'The ID of the updated record',
      required: true,
    },
    {
      name: 'fields_json',
      type: ParameterType.STRING,
      label: 'Record Fields (JSON)',
      description: 'All current fields from the record as JSON string',
      required: true,
    },
  ];
  input_params: ParameterDefinition[] = [
    {
      name: 'base_id',
      type: ParameterType.STRING,
      label: 'Base ID',
      description: 'The Airtable base ID (starts with app...)',
      required: true,
    },
    {
      name: 'table_id',
      type: ParameterType.STRING,
      label: 'Table ID or Name',
      description: 'The table ID or name',
      required: true,
    },
  ];

  reload_cache(): Promise<Record<string, unknown>> {
    return Promise.resolve({ recordSnapshots: {} });
  }

  poll(sconf: ServiceConfig): Promise<ActionTriggerOutput> {
    const accessToken = sconf.config.access_token as string | undefined;
    const baseId = sconf.config.base_id as string | undefined;
    const tableId = sconf.config.table_id as string | undefined;

    logger.debug(
      `Polling for updated records in base ${baseId}, table ${tableId}`,
    );

    if (!accessToken || !baseId || !tableId) {
      logger.debug('Missing required config, skipping poll');
      return Promise.resolve({ triggered: false, parameters: {} });
    }

    const recordSnapshots =
      (sconf.cache?.recordSnapshots as Record<string, string>) || {};

    return new Promise((resolve) => {
      axios
        .get<AirtableListResponse>(
          `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params: {
              maxRecords: 20,
            },
          },
        )
        .then((resp) => {
          logger.debug(`Airtable API response status: ${resp.status}`);

          const data = resp.data;
          if (!data?.records || data.records.length === 0) {
            logger.debug('No records found');
            return resolve({ triggered: false, parameters: {} });
          }

          // Check for updated records by comparing field snapshots
          let updatedRecord: AirtableRecord | null = null;

          for (const record of data.records) {
            const currentSnapshot = JSON.stringify(record.fields);
            const previousSnapshot = recordSnapshots[record.id];

            if (previousSnapshot && currentSnapshot !== previousSnapshot) {
              updatedRecord = record;
              break;
            }
          }

          // Update snapshots cache
          const newSnapshots: Record<string, string> = {};
          for (const record of data.records) {
            newSnapshots[record.id] = JSON.stringify(record.fields);
          }

          if (!updatedRecord) {
            logger.debug('No updated records detected');
            return resolve({
              triggered: false,
              parameters: {},
              cache: { recordSnapshots: newSnapshots },
            });
          }

          logger.log(`Record updated: ${updatedRecord.id}`);

          resolve({
            triggered: true,
            parameters: {
              record_id: {
                type: ParameterType.STRING,
                value: updatedRecord.id,
              },
              fields_json: {
                type: ParameterType.STRING,
                value: JSON.stringify(updatedRecord.fields),
              },
            },
            cache: { recordSnapshots: newSnapshots },
          });
        })
        .catch((error: unknown) => {
          const errorMessage =
            error instanceof Error
              ? error.message
              : typeof error === 'string'
                ? error
                : 'Unknown error';
          logger.error(`Failed to fetch records: ${errorMessage}`);
          return resolve({ triggered: false, parameters: {} });
        });
    });
  }
}
