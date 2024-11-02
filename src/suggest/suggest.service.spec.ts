import { Test, TestingModule } from '@nestjs/testing';
import { SuggestService } from './suggest.service';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER, CacheModule, Cache } from '@nestjs/cache-manager';
import { lastValueFrom, Observable, of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { InternalServerErrorException } from '@nestjs/common';

describe('SuggestService', () => {
  let service: SuggestService;
  let httpService: HttpService;
  let cacheManager: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        SuggestService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SuggestService>(SuggestService);
    httpService = module.get<HttpService>(HttpService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  it('should return cached suggestion when cache hit', (done) => {
    const query = 'test';
    const locale = 'fr_FR';
    const cachedResponse = {
      data: { suggestions: ['cached suggestion'] },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    } as AxiosResponse<any>;

    jest.spyOn(cacheManager, 'get').mockResolvedValue(cachedResponse.data);

    service.getSuggestions(query, locale).subscribe((result) => {
      expect(result).toEqual(cachedResponse.data);
      expect(httpService.get).not.toHaveBeenCalled();
      done();
    });
  });

  it('should fetch suggestions and set cache from Qwant API on cache miss', (done) => {
    const query = 'test';
    const locale = 'fr_FR';
    const apiResponse = {
      data: { suggestions: ['api suggestion'] },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    } as AxiosResponse<any>;

    jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
    jest.spyOn(httpService, 'get').mockReturnValue(of(apiResponse));
    jest.spyOn(cacheManager, 'set').mockResolvedValue();

    service.getSuggestions(query, locale).subscribe((result) => {
      expect(result).toEqual(apiResponse.data);
      expect(httpService.get).toHaveBeenCalledWith(service['QWANT_API_URL'], {
        params: { q: query, locale, version: service['QWANT_API_VERSION'] },
      });
      expect(cacheManager.set).toHaveBeenCalledWith(
        `suggest:${query}:${locale}`,
        apiResponse.data,
      );
      done();
    });
  });

  it('test_get_suggestions_api_error_handling', (done) => {
    const query = 'test';
    const locale = 'fr_FR';
    const error = new Error('Mock API error');

    jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
    jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => error));
    jest.spyOn(service['logger'], 'error');

    service.getSuggestions(query, locale).subscribe({
      error: (err) => {
        expect(err).toBeInstanceOf(InternalServerErrorException);
        expect(service['logger'].error).toHaveBeenCalledWith(
          `Error making Qwant API request: ${error.message}`,
        );
        done();
      },
    });
  });
  it('should log error when failing to set cache', async () => {
    const suggestService = new SuggestService(httpService, cacheManager);
    const query = 'test';
    const locale = 'fr_FR';
    const apiResponse = { data: 'api data' } as AxiosResponse;
    jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
    jest.spyOn(httpService, 'get').mockReturnValue(of(apiResponse));
    jest.spyOn(cacheManager, 'set').mockRejectedValue(new Error('Cache error'));
    const logSpy = jest.spyOn(suggestService['logger'], 'error');

    await lastValueFrom(suggestService.getSuggestions(query, locale));

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to set cache'),
    );
  });
  it('should return observable of suggestions data', async () => {
    const suggestService = new SuggestService(httpService, cacheManager);
    const query = 'test';
    const locale = 'fr_FR';
    const apiResponse = { data: 'api data' } as AxiosResponse;
    jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
    jest.spyOn(httpService, 'get').mockReturnValue(of(apiResponse));

    const result$ = suggestService.getSuggestions(query, locale);

    expect(result$).toBeInstanceOf(Observable);
  });

  it('should ensure cache key uniqueness for different queries', async () => {
    const suggestService = new SuggestService(httpService, cacheManager);
    const query1 = 'test1';
    const query2 = 'test2';
    jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
    jest
      .spyOn(httpService, 'get')
      .mockReturnValue(of({ data: 'api data' } as AxiosResponse));

    await lastValueFrom(suggestService.getSuggestions(query1));
    await lastValueFrom(suggestService.getSuggestions(query2));

    expect(cacheManager.get).toHaveBeenCalledWith(`suggest:${query1}:fr_FR`);
    expect(cacheManager.get).toHaveBeenCalledWith(`suggest:${query2}:fr_FR`);
  });
});
