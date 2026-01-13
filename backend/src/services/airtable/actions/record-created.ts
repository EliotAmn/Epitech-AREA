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

export class RecordCreated extends ServiceActionDefinition {
  name = 'airtable.record_created';
  label = 'On new record created';
  description = 'Triggered when a new record is created in a table';
  poll_interval = 60; // Check every minute
  output_params: ParameterDefinition[] = [
    {
      name: 'record_id',
      type: ParameterType.STRING,
      label: 'Record ID',
      description: 'The ID of the created record',
      required: true,
    },
    {
      name: 'created_time',
      type: ParameterType.STRING,
      label: 'Created Time',
      description: 'When the record was created',
      required: true,
    },
    {
      name: 'fields_json',
      type: ParameterType.STRING,
      label: 'Record Fields (JSON)',
      description: 'All fields from the record as JSON string',
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
    return Promise.resolve({ lastRecordIds: [] });
  }

  poll(sconf: ServiceConfig): Promise<ActionTriggerOutput> {
    const accessToken = sconf.config.access_token as string | undefined;
    const baseId = sconf.config.base_id as string | undefined;
    const tableId = sconf.config.table_id as string | undefined;

    logger.debug(`Polling for new records in base ${baseId}, table ${tableId}`);

    if (!accessToken || !baseId || !tableId) {
      logger.debug('Missing required config, skipping poll');
      return Promise.resolve({ triggered: false, parameters: {} });
    }

    const lastRecordIds = (sconf.cache?.lastRecordIds as string[]) || [];

    return new Promise((resolve) => {
      axios
        .get<AirtableListResponse>(
          `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params: {
              maxRecords: 100,
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

          const currentRecordIds = data.records.map((r) => r.id);

          // Find new records (not in cache)
          const newRecords = data.records.filter(
            (record) => !lastRecordIds.includes(record.id),
          );

          if (newRecords.length === 0) {
            logger.debug('No new records detected');
            return resolve({
              triggered: false,
              parameters: {},
              cache: { lastRecordIds: currentRecordIds },
            });
          }

          // Get the most recent new record
          const newRecord = newRecords[0];

          logger.log(`New record created: ${newRecord.id}`);

          resolve({
            triggered: true,
            parameters: {
              record_id: {
                type: ParameterType.STRING,
                value: newRecord.id,
              },
              created_time: {
                type: ParameterType.STRING,
                value: newRecord.createdTime,
              },
              fields_json: {
                type: ParameterType.STRING,
                value: JSON.stringify(newRecord.fields),
              },
            },
            cache: { lastRecordIds: currentRecordIds },
          });
        })
        .catch((error) => {
          logger.error(`Failed to fetch records: ${error.message}`);
          return resolve({ triggered: false, parameters: {} });
        });
    });
  }
}
