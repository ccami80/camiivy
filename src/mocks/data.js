/**
 * 목업 API용 공통 데이터. api-mock 라우트와 MSW handlers에서 공유.
 */

export const mockProducts = [
  {
    id: 'mock-product-1',
    name: 'Mock Product 1',
    brand: 'MockBrand',
    petType: 'DOG',
    basePrice: 29000,
    category: { id: 'mock-cat-1', name: '사료', slug: 'food' },
    images: [{ id: 'mock-img-1', type: 'main', url: '/img/placeholder.png', sortOrder: 0 }],
  },
  {
    id: 'mock-product-2',
    name: 'Mock Product 2',
    brand: 'MockBrand',
    petType: 'DOG',
    basePrice: 15000,
    category: { id: 'mock-cat-2', name: '간식', slug: 'snack' },
    images: [],
  },
];

export const mockCategories = [
  { id: 'mock-cat-1', name: '사료', slug: 'food', petType: 'DOG', sortOrder: 0, parentId: null },
  { id: 'mock-cat-2', name: '간식', slug: 'snack', petType: 'DOG', sortOrder: 1, parentId: null },
];

export const mockBanners = [
  {
    id: 'mock-banner-1',
    imageUrl: '/img/placeholder.png',
    linkUrl: null,
    title: 'Mock Banner',
    description: null,
    sortOrder: 0,
    isActive: true,
  },
];
