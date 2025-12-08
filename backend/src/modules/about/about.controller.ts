import { Controller, Get, Ip } from '@nestjs/common';
import { AboutService } from './about.service';
import type { AboutResponse } from './about.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AboutController {
  constructor(
    private readonly aboutService: AboutService,
  ) {}

  @Get('about.json')
  @ApiOperation({ summary: 'Get service information and client details' })
  @ApiResponse({ status: 200, description: 'Returns client IP, server time, and available services' })
  getAbout(@Ip() clientIp: string): AboutResponse {
    return this.aboutService.getAboutInfo(clientIp);
  }
}
