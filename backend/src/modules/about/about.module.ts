import { Module } from '@nestjs/common';
import { AboutController } from './about.controller';
import { AboutService } from './about.service';
import { ServiceImporterModule } from '../service_importer/service_importer.module';

@Module({
  imports: [ServiceImporterModule.register()],
  controllers: [AboutController],
  providers: [AboutService],
  exports: [AboutService],
})
export class AboutModule {}
