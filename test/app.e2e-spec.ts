import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return suggestions when a valid query is provided', async () => {
    const response = await request(app.getHttpServer())
      .get('/suggest')
      .query({ q: 'test' })
      .expect(200);
    expect(response.body).toBeDefined();
    expect(response.body).toHaveProperty('data');
  });

  it('should return a 200 HTTP status code on successful suggestion', async () => {
    await request(app.getHttpServer())
      .get('/suggest')
      .query({ q: 'test' })
      .expect(200);
  });

  it('should handle empty query parameters', async () => {
    const response = await request(app.getHttpServer())
      .get('/suggest')
      .query({ q: '' })
      .expect(400);
    expect(response.body.message).toContain('q should not be empty');
  });
});
