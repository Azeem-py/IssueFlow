import { NestFactory, Reflector } from '@nestjs/core';
import {
  ValidationPipe,
  ClassSerializerInterceptor,
  INestApplication,
} from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

// 1. Shared Configuration Function
export function configureApp(app: INestApplication) {
  // CORS
  const frontendUrl = process.env.FRONTEND_URL;
  app.enableCors({
    origin: frontendUrl 
      ? frontendUrl.split(',').map(url => url.trim().replace(/\/$/, '')) 
      : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-org-id', 'x-api-key'],
  });

  // Cookies
  app.use(cookieParser());

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Serialization
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('IssueFlow API')
    .setDescription('The IssueFlow core API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}

// 2. Local Development Bootstrap
if (require.main === module) {
  const bootstrap = async () => {
    const app = await NestFactory.create(AppModule, { 
      bufferLogs: true,
    });
    
    app.useLogger(app.get(Logger));
    
    configureApp(app);

    const port = process.env.PORT || 3000;
    await app.listen(port);
    
    const logger = app.get(Logger);
    logger.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
    logger.log(`📜 Swagger documentation: http://localhost:${port}/api/docs`);
  };
  void bootstrap();
}

// 3. Vercel Serverless Handler
let cachedApp: any;

export default async (req: any, res: any) => {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule, {
      bufferLogs: true,
    });
    
    app.useLogger(app.get(Logger));
    
    configureApp(app);
    await app.init();
    cachedApp = app.getHttpAdapter().getInstance();
  }
  return cachedApp(req, res);
};
