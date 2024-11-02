import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {
  catchError,
  from,
  map,
  Observable,
  of,
  switchMap,
  throwError,
} from 'rxjs';
import { AxiosResponse } from 'axios';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class SuggestService {
  private logger = new Logger('SuggestService');
  private QWANT_API_URL = 'https://api.qwant.com/v3/suggest';
  private QWANT_API_VERSION = '4';
  constructor(
    private httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  getSuggestions(
    query: string,
    locale = 'fr_FR',
  ): Observable<AxiosResponse<any>> {
    const params = {
      q: query,
      locale,
      version: this.QWANT_API_VERSION,
    };

    const cacheKey = `suggest:${query}:${locale}`;
    return from(this.cacheManager.get<AxiosResponse<any>>(cacheKey)).pipe(
      switchMap((cachedValue) => {
        if (cachedValue) {
          // cache hit, return it as an observable
          return of(cachedValue);
        }

        // cache miss, proceed with API request
        return this.httpService.get(this.QWANT_API_URL, { params }).pipe(
          map((response) => {
            // Cache the API response
            this.cacheManager
              .set(cacheKey, response.data)
              .catch((e) => this.logger.error(`Failed to set cache : ${e}`));
            return response.data;
          }),
          catchError((error) => {
            this.logger.error(
              `Error making Qwant API request: ${error.message}`,
            );
            return throwError(
              () =>
                new InternalServerErrorException(
                  'Failed to fetch Qwant suggestions',
                ),
            );
          }),
        );
      }),
    );
  }
}
