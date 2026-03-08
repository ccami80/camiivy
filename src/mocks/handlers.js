/**
 * MSW request handlers for mocking API routes.
 * Used by both browser (dev) and Node (tests). Mock data from @/mocks/data (api-mock과 공유).
 * @see https://mswjs.io/docs/basics/request-handler
 */
import { http, HttpResponse } from 'msw';
import { mockProducts, mockCategories, mockBanners } from './data.js';

export const handlers = [
  http.get('/api/products', () => HttpResponse.json(mockProducts)),
  http.get('/api/products/:id', ({ params }) =>
    HttpResponse.json({
      ...mockProducts[0],
      id: params?.id ?? 'mock-product-1',
      description: 'Mock product detail.',
    })
  ),
  http.get('/api/categories', () => HttpResponse.json(mockCategories)),
  http.get('/api/banners', () => HttpResponse.json(mockBanners)),
  http.get('/api/home-sections', () => HttpResponse.json([])),
  http.get('/api/brands', () => HttpResponse.json([])),
  http.get('/api/curation', () => HttpResponse.json([])),
];
