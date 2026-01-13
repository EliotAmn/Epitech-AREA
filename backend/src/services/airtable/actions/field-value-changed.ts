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

export class FieldValueChanged extends ServiceActionDefinition {
  name = 'airtable.field_value_changed';
  label = 'On specific field value changed';
  description = 'Triggered when a specific field value changes in any record';
  poll_interval = 10; // Check every minute
  output_params: ParameterDefinition[] = [
    {
      name: 'record_id',
      type: ParameterType.STRING,
      label: 'Record ID',
      description: 'The ID of the record with the changed field',
      required: true,
    },
    {
      name: 'old_value',
      type: ParameterType.STRING,
      label: 'Old Value',
      description: 'Previous value of the field',
      required: false,
    },
    {
      name: 'new_value',
      type: ParameterType.STRING,
      label: 'New Value',
      description: 'Current value of the field',
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
    {
      name: 'field_name',
      type: ParameterType.STRING,
      label: 'Field Name',
      description: 'The name of the field to monitor',
      required: true,
    },
  ];

  reload_cache(): Promise<Record<string, unknown>> {
    return Promise.resolve({ fieldValues: {} });
  }

  poll(sconf: ServiceConfig): Promise<ActionTriggerOutput> {
    const accessToken = sconf.config.access_token as string | undefined;
    const baseId = sconf.config.base_id as string | undefined;
    const tableId = sconf.config.table_id as string | undefined;
    const fieldName = sconf.config.field_name as string | undefined;

    logger.debug(
      `Polling for field changes: ${fieldName} in base ${baseId}, table ${tableId}`,
    );

    if (!accessToken || !baseId || !tableId || !fieldName) {
      logger.debug('Missing required config, skipping poll');
      return Promise.resolve({ triggered: false, parameters: {} });
    }

    const fieldValues = (sconf.cache?.fieldValues as Record<
      string,
      string
    >) || {};

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

          // Check for field value changes
          let changedRecord: {
            record: AirtableRecord;
            oldValue: string;
            newValue: string;
          } | null = null;

          const newFieldValues: Record<string, string> = {};

          for (const record of data.records) {
            const currentValue = record.fields[fieldName];
            const currentValueStr =
              currentValue !== undefined ? String(currentValue) : '';
            const previousValueStr = fieldValues[record.id] || '';

            newFieldValues[record.id] = currentValueStr;

            if (
              previousValueStr &&
              currentValueStr !== previousValueStr &&
              !changedRecord
            ) {
              changedRecord = {
                record,
                oldValue: previousValueStr,
                newValue: currentValueStr,
              };
            }
          }

          if (!changedRecord) {
            logger.debug('No field value changes detected');
            return resolve({
              triggered: false,
              parameters: {},
              cache: { fieldValues: newFieldValues },
            });
          }

          logger.log(
            `Field "${fieldName}" changed in record ${changedRecord.record.id}`,
          );

          resolve({
            triggered: true,
            parameters: {
              record_id: {
                type: ParameterType.STRING,
                value: changedRecord.record.id,
              },
              old_value: {
                type: ParameterType.STRING,
                value: changedRecord.oldValue,
              },
              new_value: {
                type: ParameterType.STRING,
                value: changedRecord.newValue,
              },
            },
            cache: { fieldValues: newFieldValues },
          });
        })
        .catch((error) => {
          logger.error(`Failed to fetch records: ${error.message}`);
          return resolve({ triggered: false, parameters: {} });
        });
    });
  }
}
