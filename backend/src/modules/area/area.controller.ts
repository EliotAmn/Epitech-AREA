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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { AreaService } from './area.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';

@ApiTags('areas')
@ApiBearerAuth()
@Controller('areas')
export class AreaController {
  constructor(private readonly areaService: AreaService) {}

  @Post()
  @ApiOperation({ summary: 'Create an area for the authenticated user' })
  @ApiBody({ type: CreateAreaDto })
  @ApiResponse({ status: 201, description: 'Area created' })
  async create(
    @Req() req: Request & { user?: { sub?: string } },
    @Body() dto: CreateAreaDto,
  ) {
    const userId = req.user?.sub as string;
    return this.areaService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all areas for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of areas' })
  async findMyAreas(@Req() req: Request & { user?: { sub?: string } }) {
    const userId = req.user?.sub as string;
    return this.areaService.findByUser(userId);
  }

  @Post(':id/reload')
  @ApiOperation({ summary: 'Reload an area by its ID' })
  @ApiParam({ name: 'id', description: 'Area ID' })
  @ApiResponse({ status: 200, description: 'Area reloaded' })
  async reloadArea(@Param('id') id: string) {
    await this.areaService.initializeOne(id);
    return { ok: true };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an area by its ID' })
  @ApiParam({ name: 'id', description: 'Area ID' })
  @ApiResponse({ status: 200, description: 'Area deleted' })
  async deleteArea(
    @Req() req: Request & { user?: { sub?: string } },
    @Param('id') id: string,
  ) {
    const userId = req.user?.sub;
    await this.areaService.deleteArea(id, userId);
    return { ok: true };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an area (name, or params) by its ID' })
  @ApiParam({ name: 'id', description: 'Area ID' })
  @ApiBody({ type: UpdateAreaDto })
  @ApiResponse({ status: 200, description: 'Area updated' })
  async updateParams(@Param('id') id: string, @Body() dto: UpdateAreaDto) {
    return this.areaService.updateParams(id, dto);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle area enabled state' })
  @ApiParam({ name: 'id', description: 'Area ID' })
  @ApiResponse({ status: 200, description: 'Area enabled state toggled' })
  async toggleEnabled(
    @Req() req: Request & { user?: { sub?: string } },
    @Param('id') id: string,
  ) {
    const userId = req.user?.sub;
    return this.areaService.toggleEnabled(id, userId);
  }

  @Post(':id/test')
  @ApiOperation({ summary: 'Manually trigger an area test' })
  @ApiParam({ name: 'id', description: 'Area ID' })
  @ApiResponse({ status: 200, description: 'Area test triggered' })
  async testArea(
    @Req() req: Request & { user?: { sub?: string } },
    @Param('id') id: string,
  ) {
    const userId = req.user?.sub;
    return this.areaService.testArea(id, userId);
  }
}
