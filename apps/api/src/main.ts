import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Common Vite ports
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('IssueFlow API')
    .setDescription('The IssueFlow core API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = 3000;
  await app.listen(port);
  
  const logger = app.get(Logger);
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📜 Swagger documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
