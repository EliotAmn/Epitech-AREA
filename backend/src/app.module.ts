import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { DiscordListenerService } from './services/discord-listener.service';
import { DiscordWebhookService } from './services/discord-webhook.service';
import { ServicesRegistry } from './services/services.registry';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
    }),
    PrismaModule,
    UserModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    DiscordWebhookService,
    DiscordListenerService,
    {
      provide: 'SERVICES',
      useFactory: (discord: DiscordWebhookService) => [discord],
      inject: [DiscordWebhookService],
    },
    ServicesRegistry,
  ],
})
export class AppModule {}
