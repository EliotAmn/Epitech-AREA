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

const logger = new Logger('AirtableService');

interface AirtableDeleteResponse {
  deleted: boolean;
  id: string;
}

export class DeleteRecord extends ServiceReactionDefinition {
  name = 'airtable.delete_record';
  label = 'Delete Record';
  description = 'Delete a record from an Airtable table';
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
      name: 'record_id',
      type: ParameterType.STRING,
      label: 'Record ID',
      description: 'The ID of the record to delete',
      required: true,
    },
  ];

  async execute(
    sconf: ServiceConfig,
    params: Record<string, ParameterValue>,
  ): Promise<void> {
    const accessToken = sconf.config.access_token as string | undefined;
    const baseId = params.base_id?.value as string;
    const tableId = params.table_id?.value as string;
    const recordId = params.record_id?.value as string;

    if (!accessToken) {
      logger.error('No access token available for Airtable');
      throw new Error('No access token available');
    }

    if (!baseId || !tableId || !recordId) {
      logger.error('Missing required parameters');
      throw new Error('Base ID, Table ID, and Record ID are required');
    }

    logger.debug(`Deleting record ${recordId} from base ${baseId}, table ${tableId}`);

    try {
      const response = await axios.delete<AirtableDeleteResponse>(
        `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}/${recordId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.data.deleted) {
        logger.log(`Successfully deleted record: ${response.data.id}`);
      } else {
        logger.warn(`Record deletion response indicated not deleted: ${recordId}`);
      }
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: unknown } };
      logger.error(
        `Failed to delete record: ${JSON.stringify(err.response?.data)}`,
      );
      throw new Error(`Failed to delete record: ${err.response?.status}`);
    }
  }

  reload_cache(): Promise<Record<string, unknown>> {
    return Promise.resolve({});
  }
}
