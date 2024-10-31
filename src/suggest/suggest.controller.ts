import { Body, Controller, Post } from '@nestjs/common';
import { SuggestService } from './suggest.service';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';

@Controller('suggest')
export class SuggestController {
  constructor(private readonly suggestService: SuggestService) {}

  @Post()
  suggest(@Body('q') q: string): Observable<AxiosResponse<any>> {
    return this.suggestService.getSuggestions(q);
  }
}
