import { Module } from '@nestjs/common';
import { SuggestService } from './suggest.service';
import { SuggestController } from './suggest.controller';
import { HttpModule } from '@nestjs/axios';
import { ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    HttpModule,
    CacheModule.register({
      ttl: 60000,
      max: 100,
    }),
  ],
  controllers: [SuggestController],
  providers: [
    SuggestService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [SuggestService],
})
export class SuggestModule {}
