import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import configuration from './common/configuration';
import { DiscordClientManager } from './services/discord/discord.client';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Auto validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('AREA API')
    .setDescription('API documentation for AREA backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  // CORS
  app.enableCors({
    origin: configuration().allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  // Initialize Discord bot
  const discordToken = configuration().discordBotToken;
  if (discordToken) {
    try {
      logger.log('Initializing Discord bot...');
      await DiscordClientManager.getInstance().initialize(discordToken);
      logger.log('Discord bot initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Discord bot:', error);
      logger.warn('Discord service will not be available');
    }
  } else {
    logger.warn('DISCORD_BOT_TOKEN not found in environment variables. Discord service will not be available.');
  }

  await app.listen(process.env.PORT || 3000);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
