import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { getTransformationMetadata } from '@/common/transformation-registry';

@ApiTags('common')
@Controller('common')
export class CommonController {
  @Get('transformations')
  @ApiOperation({ summary: 'Get available variable transformations' })
  @ApiResponse({
    status: 200,
    description: 'List of transformation functions with metadata',
  })
  getTransformations() {
    return {
      transformations: getTransformationMetadata(),
    };
  }
}
