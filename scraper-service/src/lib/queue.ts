/**
 * Bull Queue Setup for Background Jobs
 * Following Skill.md Scraper Service Architecture
 */

import Queue from 'bull'
import IORedis from 'ioredis'

// Redis connection
const redisConfig = process.env.REDIS_URL || 'redis://localhost:6379'

// Create Redis client
export const redis = new IORedis(redisConfig, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
})

// Queue options
const defaultJobOptions: Queue.JobOptions = {
  removeOnComplete: 100, // Keep last 100 completed jobs
  removeOnFail: 50, // Keep last 50 failed jobs
  attempts: parseInt(process.env.MAX_RETRIES || '3'),
  backoff: {
    type: 'exponential',
    delay: 60000, // Start with 1 minute backoff
  },
}

// Create queues
export const scrapeQueue = new Queue('scrape-testimonials', redisConfig, {
  defaultJobOptions,
})

export const analyzeQueue = new Queue('analyze-testimonials', redisConfig, {
  defaultJobOptions,
})

export const notifyQueue = new Queue('send-notifications', redisConfig, {
  defaultJobOptions,
})

export const rebuildQueue = new Queue('rebuild-site', redisConfig, {
  defaultJobOptions,
})

// Queue event handlers for logging
const setupQueueLogging = (queue: Queue.Queue, name: string) => {
  queue.on('completed', (job) => {
    console.log(`[${name}] Job ${job.id} completed`)
  })

  queue.on('failed', (job, err) => {
    console.error(`[${name}] Job ${job.id} failed:`, err.message)
  })

  queue.on('error', (err) => {
    console.error(`[${name}] Queue error:`, err.message)
  })

  queue.on('stalled', (job) => {
    console.warn(`[${name}] Job ${job.id} stalled`)
  })
}

// Setup logging for all queues
setupQueueLogging(scrapeQueue, 'scrape')
setupQueueLogging(analyzeQueue, 'analyze')
setupQueueLogging(notifyQueue, 'notify')
setupQueueLogging(rebuildQueue, 'rebuild')

// Job data types
export interface ScrapeJobData {
  connectionId: string
  platform: 'twitter' | 'linkedin' | 'g2' | 'producthunt'
  projectId: string
}

export interface AnalyzeJobData {
  testimonialId: string
  contentText: string
}

export interface NotifyJobData {
  projectId: string
  type: 'new_testimonials' | 'scrape_complete' | 'error'
  count?: number
  message?: string
}

export interface RebuildJobData {
  projectId: string
  force?: boolean
}

// Helper to add jobs
export async function addScrapeJob(data: ScrapeJobData): Promise<Queue.Job<ScrapeJobData>> {
  return scrapeQueue.add(data, {
    jobId: `scrape-${data.connectionId}-${Date.now()}`,
  })
}

export async function addAnalyzeJob(data: AnalyzeJobData): Promise<Queue.Job<AnalyzeJobData>> {
  return analyzeQueue.add(data, {
    jobId: `analyze-${data.testimonialId}`,
  })
}

export async function addNotifyJob(data: NotifyJobData): Promise<Queue.Job<NotifyJobData>> {
  return notifyQueue.add(data)
}

export async function addRebuildJob(data: RebuildJobData): Promise<Queue.Job<RebuildJobData>> {
  return rebuildQueue.add(data, {
    jobId: `rebuild-${data.projectId}-${Date.now()}`,
  })
}

// Get queue stats
export async function getQueueStats() {
  const [scrapeStats, analyzeStats, notifyStats, rebuildStats] = await Promise.all([
    scrapeQueue.getJobCounts(),
    analyzeQueue.getJobCounts(),
    notifyQueue.getJobCounts(),
    rebuildQueue.getJobCounts(),
  ])

  return {
    scrape: scrapeStats,
    analyze: analyzeStats,
    notify: notifyStats,
    rebuild: rebuildStats,
  }
}

// Graceful shutdown
export async function closeQueues(): Promise<void> {
  await Promise.all([
    scrapeQueue.close(),
    analyzeQueue.close(),
    notifyQueue.close(),
    rebuildQueue.close(),
    redis.quit(),
  ])
}
