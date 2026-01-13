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

interface AirtableCreateResponse {
  id: string;
  createdTime: string;
  fields: Record<string, any>;
}

export class CreateRecord extends ServiceReactionDefinition {
  name = 'airtable.create_record';
  label = 'Create Record';
  description = 'Create a new record in an Airtable table';
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
      name: 'fields_json',
      type: ParameterType.STRING,
      label: 'Fields (JSON)',
      description:
        'Record fields as JSON string, e.g. {"Name": "John", "Email": "john@example.com"}',
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
    const fieldsJson = params.fields_json?.value as string;

    if (!accessToken) {
      logger.error('No access token available for Airtable');
      throw new Error('No access token available');
    }

    if (!baseId || !tableId || !fieldsJson) {
      logger.error('Missing required parameters');
      throw new Error('Base ID, Table ID, and Fields JSON are required');
    }

    logger.debug(`Creating record in base ${baseId}, table ${tableId}`);

    let fields: Record<string, any>;
    try {
      fields = JSON.parse(fieldsJson) as Record<string, any>;
    } catch {
      logger.error(`Invalid JSON in fields_json: ${fieldsJson}`);
      throw new Error('Fields JSON is not valid JSON');
    }

    try {
      const response = await axios.post<AirtableCreateResponse>(
        `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}`,
        {
          fields,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      logger.log(`Successfully created record: ${response.data.id}`);
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: unknown } };
      logger.error(
        `Failed to create record: ${JSON.stringify(err.response?.data)}`,
      );
      throw new Error(`Failed to create record: ${err.response?.status}`);
    }
  }

  reload_cache(): Promise<Record<string, unknown>> {
    return Promise.resolve({});
  }
}
