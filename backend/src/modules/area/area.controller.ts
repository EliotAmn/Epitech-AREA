import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { AreaService } from './area.service';
import { CreateAreaDto } from './dto/create-area.dto';

@ApiTags('areas')
@Controller('areas')
export class AreaController {
  constructor(private readonly areaService: AreaService) {}

  @Post()
  @ApiOperation({ summary: 'Create an area for the authenticated user' })
  @ApiResponse({ status: 201, description: 'Area created' })
  async create(
    @Req() req: Request & { user?: { sub?: string } },
    @Body() dto: CreateAreaDto,
  ) {
    const userId = req.user?.sub as string;
    return this.areaService.create(userId, dto);
  }

  @Get()
  async findMyAreas(@Req() req: Request & { user?: { sub?: string } }) {
    const userId = req.user?.sub as string;
    return this.areaService.findByUser(userId);
  }

  @Post(':id/reload')
  async reloadArea(@Param('id') id: string) {
    await this.areaService.initializeOne(id);
    return { ok: true };
  }

  @Delete(':id')
  async deleteArea(
    @Req() req: Request & { user?: { sub?: string } },
    @Param('id') id: string,
  ) {
    const userId = req.user?.sub;
    await this.areaService.deleteArea(id, userId);
    return { ok: true };
  }

  @Patch(':id')
  async updateParams(
    @Param('id') id: string,
    @Body()
    dto: {
      actions?: Array<{ id: string; params?: Record<string, unknown> }>;
      reactions?: Array<{ id: string; params?: Record<string, unknown> }>;
    },
  ) {
    return this.areaService.updateParams(id, dto);
  }
}
