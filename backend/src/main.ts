import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import configuration from './common/configuration';
import { AreaService } from './modules/area/area.service';
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
  const allowedOrigins = configuration().allowedOrigins;
  app.enableCors({
    origin: allowedOrigins.includes('*') ? true : allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
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
    logger.warn(
      'DISCORD_BOT_TOKEN not found in environment variables. Discord service will not be available.',
    );
  }

  // Initialize area action handlers and reaction caches for existing areas
  try {
    const areaService = app.get(AreaService);
    if (areaService && typeof areaService.initializeAll === 'function') {
      logger.log('Initializing existing areas...');
      await areaService.initializeAll();
      logger.log('Areas initialized');
    }
  } catch (err) {
    logger.error('Failed to initialize areas at startup:', err);
  }

  await app.listen(process.env.PORT || 3000);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
