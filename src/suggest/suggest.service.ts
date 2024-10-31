import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, map, Observable, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class SuggestService {
  private QWANT_API_URL = 'https://api.qwant.com/v3/suggest';
  private QWANT_API_VERSION = '4';
  constructor(private httpService: HttpService) {}

  getSuggestions(
    query: string,
    locale = 'fr_FR',
  ): Observable<AxiosResponse<any>> {
    const params = {
      q: query,
      locale,
      version: this.QWANT_API_VERSION,
    };

    return this.httpService.get(this.QWANT_API_URL, { params }).pipe(
      map((response) => response.data),
      catchError((error) => {
        console.error('Error making Qwant API request:', error.message);
        return throwError(() => new Error('Failed to fetch Qwant suggestions'));
      }),
    );
  }
}
