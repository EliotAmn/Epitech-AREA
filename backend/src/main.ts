import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import configuration from './common/configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validation DTO automatique
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

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
