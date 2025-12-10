import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('services/spotify')
@Controller('services/spotify')
export class SpotifyController {
  constructor() {}
}
