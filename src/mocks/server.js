/**
 * MSW server for Node (e.g. Jest, Vitest).
 * Usage in test setup:
 *   import { server } from '@/mocks/server';
 *   beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
 *   afterEach(() => server.resetHandlers());
 *   afterAll(() => server.close());
 */
import { setupServer } from 'msw/node';
import { handlers } from './handlers.js';

export const server = setupServer(...handlers);
