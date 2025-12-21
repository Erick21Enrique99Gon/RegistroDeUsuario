import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppErrorRestFilter } from './infrastructure/filters/rest/app_error.rest.filters';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const ctx = app.getHttpAdapter().getInstance();

  app.useGlobalFilters(new AppErrorRestFilter(ctx));

   const config = new DocumentBuilder()
    .setTitle('Sistema API')
    .setDescription('Sistema de manejo de usuario')
    .setVersion('1.0')
    .addTag('dogs')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); 

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
