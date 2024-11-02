import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { SuggestService } from './suggest.service';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { SuggestGetDto } from './suggest.dto';

@Controller('suggest')
export class SuggestController {
  constructor(private readonly suggestService: SuggestService) {}

  @Get()
  @HttpCode(200)
  suggest(
    @Query() { q }: SuggestGetDto,
  ): Promise<AxiosResponse<any> | Observable<AxiosResponse<any>>> {
    return this.suggestService.getSuggestions(q);
  }
}
