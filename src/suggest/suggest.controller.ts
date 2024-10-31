import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { SuggestService } from './suggest.service';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { SuggestPostDto } from './suggest.interfaces';

@Controller('suggest')
export class SuggestController {
  constructor(private readonly suggestService: SuggestService) {}

  @Post()
  @HttpCode(200)
  suggest(
    @Body() { q }: SuggestPostDto,
  ): Promise<AxiosResponse<any> | Observable<AxiosResponse<any>>> {
    return this.suggestService.getSuggestions(q);
  }
}
