import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './common/configuration';
import { AboutModule } from './modules/about/about.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ServiceImporterModule } from './modules/service_importer/service_importer.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
    }),
    PrismaModule,
    UserModule,
    AboutModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    ServiceImporterModule.register(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
