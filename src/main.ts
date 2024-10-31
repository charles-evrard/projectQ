import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.setGlobalPrefix('/api/v1');

  initSwagger(app);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();

function initSwagger(app: INestApplication): void {
  // init swagger api description
  const config = new DocumentBuilder()
    .setTitle('NestJS Qwant Passthrough suggest API')
    .setDescription(
      'This Api is used to showcase a basic but complete use of Nestjs',
    )
    .addTag('ProjectQ')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/desc', app, document);
}
