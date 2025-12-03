import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AboutService } from './about.service';
import type { AboutResponse } from './about.service';

@Controller()
export class AboutController {
  constructor(
    private readonly aboutService: AboutService,
  ) {}

  @Get('about.json')
  getAbout(@Req() request: Request): AboutResponse {
    return this.aboutService.getAboutInfo(request);
  }
}
