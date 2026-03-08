/**
 * MSW worker for browser (development).
 * Start via MswProvider or manually: import { startMockWorker } from '@/mocks/browser'; startMockWorker();
 */
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers.js';

const worker = setupWorker(...handlers);

/**
 * Start the mock service worker in the browser.
 * Only call when you want to enable API mocking (e.g. when NEXT_PUBLIC_USE_MSW=true).
 */
export async function startMockWorker() {
  return worker.start({
    onUnhandledRequest: 'warn',
    quiet: false,
  });
}

export { worker };
