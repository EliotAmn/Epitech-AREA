import { Controller, Get, Ip } from '@nestjs/common';
import { AboutService } from './about.service';
import type { AboutResponse } from './about.service';

@Controller()
export class AboutController {
  constructor(
    private readonly aboutService: AboutService,
  ) {}

  @Get('about.json')
  getAbout(@Ip() clientIp: string): AboutResponse {
    return this.aboutService.getAboutInfo(clientIp);
  }
}
