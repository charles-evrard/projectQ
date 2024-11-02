import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { AppLoggerMiddleware } from './logger/logger.middleware';
import { SuggestModule } from './suggest/suggest.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    SuggestModule,
    ThrottlerModule.forRoot([
      {
        ttl: 20000,
        limit: 10,
      },
    ]),
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AppLoggerMiddleware).exclude('healthCheck').forRoutes('*');
  }
}
