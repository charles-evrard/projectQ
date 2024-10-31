import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, from, map, Observable, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class SuggestService {
  private QWANT_API_URL = 'https://api.qwant.com/v3/suggest';
  private QWANT_API_VERSION = '4';
  constructor(
    private httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getSuggestions(
    query: string,
    locale = 'fr_FR',
  ): Promise<AxiosResponse<any> | Observable<AxiosResponse<any>>> {
    const params = {
      q: query,
      locale,
      version: this.QWANT_API_VERSION,
    };

    const cacheKey = `suggest:${query}:${locale}`;
    const cachedValue =
      await this.cacheManager.get<AxiosResponse<any>>(cacheKey);
    if (cachedValue) {
      return cachedValue;
    }

    return this.httpService.get(this.QWANT_API_URL, { params }).pipe(
      map((response) => {
        this.cacheManager.set(cacheKey, response.data);
        return response.data;
      }),
      catchError((error) => {
        console.error('Error making Qwant API request:', error.message);
        return throwError(() => new Error('Failed to fetch Qwant suggestions'));
      }),
    );
  }
}
