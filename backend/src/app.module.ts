import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import configuration from './common/configuration';
import { AboutModule } from './modules/about/about.module';
import { AreaModule } from './modules/area/area.module';
import { AuthModule } from './modules/auth/auth.module';
import { CommonModule } from './modules/common/common.module';
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
    AreaModule,
    AuthModule,
    CommonModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    ServiceImporterModule.register(),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
