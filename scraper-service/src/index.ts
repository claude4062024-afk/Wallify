/**
 * Scraper Service - Main Entry Point
 * Starts both the Express API server and the background worker
 */

import { startServer } from './server';
import { startWorker } from './worker';

const MODE = process.env.MODE || 'combined';

console.log('=================================');
console.log('  Wallify Scraper Service');
console.log(`  Mode: ${MODE}`);
console.log('=================================\n');

switch (MODE) {
  case 'server':
    // Run only the API server
    startServer();
    break;

  case 'worker':
    // Run only the background worker
    startWorker();
    break;

  case 'combined':
  default:
    // Run both (default for development)
    startServer();
    startWorker();
    break;
}
