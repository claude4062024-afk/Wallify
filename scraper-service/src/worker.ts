/**
 * Scraper Service - Background Worker
 * Processes jobs from the Bull queues
 */

import { 
  scrapeQueue, 
  analyzeQueue, 
  notifyQueue, 
  rebuildQueue,
  closeQueues,
} from './lib/queue';
import { processScrapeJob } from './jobs/scrape-testimonials';
import { processAnalyzeJob } from './jobs/analyze-sentiment';
import { processRebuildJob } from './jobs/rebuild-site';
import { processNotifyJob } from './jobs/send-notifications';

// Concurrency settings
const SCRAPE_CONCURRENCY = parseInt(process.env.SCRAPE_CONCURRENCY || '2', 10);
const ANALYZE_CONCURRENCY = parseInt(process.env.ANALYZE_CONCURRENCY || '5', 10);
const NOTIFY_CONCURRENCY = parseInt(process.env.NOTIFY_CONCURRENCY || '10', 10);
const REBUILD_CONCURRENCY = parseInt(process.env.REBUILD_CONCURRENCY || '1', 10);

/**
 * Initialize and start all queue processors
 */
function startWorker(): void {
  console.log('🚀 Starting scraper service worker...');
  console.log(`   Scrape concurrency: ${SCRAPE_CONCURRENCY}`);
  console.log(`   Analyze concurrency: ${ANALYZE_CONCURRENCY}`);
  console.log(`   Notify concurrency: ${NOTIFY_CONCURRENCY}`);
  console.log(`   Rebuild concurrency: ${REBUILD_CONCURRENCY}`);

  // ============ Scrape Queue Processor ============
  scrapeQueue.process(SCRAPE_CONCURRENCY, async (job) => {
    console.log(`[Worker] Processing scrape job ${job.id}`);
    await processScrapeJob(job);
  });

  scrapeQueue.on('completed', (job) => {
    console.log(`[Worker] Scrape job ${job.id} completed`);
  });

  scrapeQueue.on('failed', (job, err) => {
    console.error(`[Worker] Scrape job ${job.id} failed:`, err.message);
  });

  scrapeQueue.on('stalled', (job) => {
    console.warn(`[Worker] Scrape job ${job.id} stalled`);
  });

  // ============ Analyze Queue Processor ============
  analyzeQueue.process(ANALYZE_CONCURRENCY, async (job) => {
    console.log(`[Worker] Processing analyze job ${job.id}`);
    await processAnalyzeJob(job);
  });

  analyzeQueue.on('completed', (job) => {
    console.log(`[Worker] Analyze job ${job.id} completed`);
  });

  analyzeQueue.on('failed', (job, err) => {
    console.error(`[Worker] Analyze job ${job.id} failed:`, err.message);
  });

  // ============ Notify Queue Processor ============
  notifyQueue.process(NOTIFY_CONCURRENCY, async (job) => {
    console.log(`[Worker] Processing notify job ${job.id}`);
    await processNotifyJob(job);
  });

  notifyQueue.on('completed', (job) => {
    console.log(`[Worker] Notify job ${job.id} completed`);
  });

  notifyQueue.on('failed', (job, err) => {
    console.error(`[Worker] Notify job ${job.id} failed:`, err.message);
  });

  // ============ Rebuild Queue Processor ============
  rebuildQueue.process(REBUILD_CONCURRENCY, async (job) => {
    console.log(`[Worker] Processing rebuild job ${job.id}`);
    await processRebuildJob(job);
  });

  rebuildQueue.on('completed', (job) => {
    console.log(`[Worker] Rebuild job ${job.id} completed`);
  });

  rebuildQueue.on('failed', (job, err) => {
    console.error(`[Worker] Rebuild job ${job.id} failed:`, err.message);
  });

  // ============ Global Event Handlers ============
  const allQueues = [scrapeQueue, analyzeQueue, notifyQueue, rebuildQueue];

  allQueues.forEach((queue) => {
    queue.on('error', (error) => {
      console.error(`[Worker] Queue error on ${queue.name}:`, error);
    });

    queue.on('waiting', (jobId) => {
      console.log(`[Worker] Job ${jobId} waiting in ${queue.name}`);
    });

    queue.on('active', (job) => {
      console.log(`[Worker] Job ${job.id} active in ${queue.name}`);
    });
  });

  console.log('✅ Worker started. Listening for jobs...');
}

/**
 * Graceful shutdown
 */
async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  try {
    // Stop processing new jobs
    await Promise.all([
      scrapeQueue.pause(),
      analyzeQueue.pause(),
      notifyQueue.pause(),
      rebuildQueue.pause(),
    ]);

    console.log('Queues paused. Waiting for active jobs to complete...');

    // Wait for active jobs to complete (with timeout)
    const timeout = setTimeout(() => {
      console.warn('Shutdown timeout. Force closing...');
      process.exit(1);
    }, 30000); // 30 second timeout

    // Close all queues
    await closeQueues();

    clearTimeout(timeout);
    console.log('Worker shut down successfully.');
    process.exit(0);

  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

// Start the worker
startWorker();

export { startWorker, gracefulShutdown };
