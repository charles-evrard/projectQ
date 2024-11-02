import { Test, TestingModule } from '@nestjs/testing';
import { SuggestService } from './suggest.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { AxiosResponse } from 'axios';

describe('SuggestService', () => {
  let service: SuggestService;
  let httpService: HttpService;
  let cacheManager: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuggestService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SuggestService>(SuggestService);
    httpService = module.get<HttpService>(HttpService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  describe('getSuggestions', () => {
    it('should return cached value', async () => {
      const query = 'cached  Query';
      const locale = 'fr_FR';
      const cacheKey = `suggest:${query}:${locale}`;
      const cachedResponse = {
        data: { results: 'cached data' },
        status: 200,
        statusText: 'OK',
      } as AxiosResponse;
      jest.spyOn(cacheManager, 'get').mockResolvedValueOnce(cachedResponse);

      const result = await service.getSuggestions(query);

      expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(result).toEqual(cachedResponse);
    });

    it('should make an API call and cache the result if not in cache', async () => {
      const query = 'allowedQuery';
      const locale = 'fr_FR';
      const cacheKey = `suggest:${query}:${locale}`;
      const apiResponse = {
        data: { results: 'api data' },
        status: 200,
        statusText: 'OK',
      } as AxiosResponse;

      jest.spyOn(cacheManager, 'get').mockResolvedValueOnce(null); // No cached value
      jest.spyOn(httpService, 'get').mockReturnValueOnce(of(apiResponse)); // Mock API response
      jest.spyOn(cacheManager, 'set').mockResolvedValueOnce(undefined); // Mock cache set

      const result = await service.getSuggestions(query);

      expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(httpService.get).toHaveBeenCalledWith(service['QWANT_API_URL'], {
        params: { q: query, locale, version: service['QWANT_API_VERSION'] },
      });
      expect(cacheManager.set).toHaveBeenCalledWith(cacheKey, apiResponse.data);
      expect(result).toEqual(apiResponse.data);
    });

    it('should handle API errors and return a custom error message', async () => {
      const query = 'allowedQuery';
      const error = new Error('API request failed');
      jest.spyOn(cacheManager, 'get').mockResolvedValueOnce(null); // No cached value
      jest
        .spyOn(httpService, 'get')
        .mockReturnValueOnce(throwError(() => error)); // Mock API error

      await expect(service.getSuggestions(query)).rejects.toThrow(
        new Error('Failed to fetch Qwant suggestions'),
      );
    });
  });

  describe('isBlacklisted', () => {
    it('should return true for blacklisted queries', () => {
      expect(service['isBlacklisted']('blocked')).toBe(true);
      expect(service['isBlacklisted']('blocked2')).toBe(true);
    });

    it('should return false for non-blacklisted queries', () => {
      expect(service['isBlacklisted']('allowedQuery')).toBe(false);
    });
  });
});
