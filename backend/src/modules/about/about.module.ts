import { Module } from '@nestjs/common';

import { ServiceImporterModule } from '@/modules/service_importer/service_importer.module';
import { AboutController } from './about.controller';
import { AboutService } from './about.service';

@Module({
  imports: [ServiceImporterModule.register()],
  controllers: [AboutController],
  providers: [AboutService],
  exports: [AboutService],
})
export class AboutModule {}
