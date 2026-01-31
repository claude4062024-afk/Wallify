/**
 * Scraper Service - Express API Server
 * Handles webhooks and API requests for triggering scrape jobs
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { 
  addScrapeJob, 
  addRebuildJob, 
  getQueueStats,
  scrapeQueue,
  analyzeQueue,
  notifyQueue,
  rebuildQueue,
} from './lib/queue';
import { getActiveConnections, supabase } from './lib/supabase';
import type { Platform } from './scrapers';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Auth middleware - verify Supabase JWT or API key
async function authenticateRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers['x-api-key'];

  // Check API key first (for internal services)
  if (apiKey === process.env.INTERNAL_API_KEY) {
    next();
    return;
  }

  // Check Supabase JWT
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    // Attach user to request
    (req as Request & { user?: typeof user }).user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Authentication failed' });
  }
}

// ============ Health Check ============

app.get('/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ============ Queue Status ============

app.get('/api/queues/stats', authenticateRequest, async (_req: Request, res: Response) => {
  try {
    const stats = await getQueueStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting queue stats:', error);
    res.status(500).json({ error: 'Failed to get queue stats' });
  }
});

// ============ Scrape Endpoints ============

// Trigger scrape for a specific connection
app.post('/api/scrape/connection/:connectionId', authenticateRequest, async (req: Request, res: Response) => {
  const { connectionId } = req.params;
  const { organizationId, priority } = req.body;

  if (!organizationId) {
    res.status(400).json({ error: 'organizationId is required' });
    return;
  }

  try {
    const job = await addScrapeJob({
      connectionId,
      organizationId,
      priority: priority || 'normal',
    });

    res.json({
      success: true,
      jobId: job.id,
      message: 'Scrape job queued',
    });
  } catch (error) {
    console.error('Error queuing scrape job:', error);
    res.status(500).json({ error: 'Failed to queue scrape job' });
  }
});

// Trigger scrape for all connections of an organization
app.post('/api/scrape/organization/:organizationId', authenticateRequest, async (req: Request, res: Response) => {
  const { organizationId } = req.params;
  const { priority } = req.body;

  try {
    const connections = await getActiveConnections(organizationId);

    if (connections.length === 0) {
      res.json({
        success: true,
        message: 'No active connections found',
        jobIds: [],
      });
      return;
    }

    const jobs = await Promise.all(
      connections.map((connection) =>
        addScrapeJob({
          connectionId: connection.id,
          organizationId,
          priority: priority || 'normal',
        })
      )
    );

    res.json({
      success: true,
      message: `${jobs.length} scrape jobs queued`,
      jobIds: jobs.map((j) => j.id),
    });
  } catch (error) {
    console.error('Error queuing scrape jobs:', error);
    res.status(500).json({ error: 'Failed to queue scrape jobs' });
  }
});

// Get scrape job status
app.get('/api/scrape/job/:jobId', authenticateRequest, async (req: Request, res: Response) => {
  const { jobId } = req.params;

  try {
    const job = await scrapeQueue.getJob(jobId);

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    const state = await job.getState();
    const progress = job.progress();

    res.json({
      id: job.id,
      state,
      progress,
      data: job.data,
      attemptsMade: job.attemptsMade,
      failedReason: job.failedReason,
      finishedOn: job.finishedOn,
      processedOn: job.processedOn,
    });
  } catch (error) {
    console.error('Error getting job status:', error);
    res.status(500).json({ error: 'Failed to get job status' });
  }
});

// ============ Rebuild Endpoints ============

// Trigger site rebuild for a project
app.post('/api/rebuild/project/:projectId', authenticateRequest, async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { organizationId, trigger } = req.body;

  if (!organizationId) {
    res.status(400).json({ error: 'organizationId is required' });
    return;
  }

  try {
    const job = await addRebuildJob({
      projectId,
      organizationId,
      trigger: trigger || 'manual',
    });

    res.json({
      success: true,
      jobId: job.id,
      message: 'Rebuild job queued',
    });
  } catch (error) {
    console.error('Error queuing rebuild job:', error);
    res.status(500).json({ error: 'Failed to queue rebuild job' });
  }
});

// ============ Webhook Endpoints ============

// Webhook for testimonial approval (triggers rebuild)
app.post('/webhooks/testimonial-approved', async (req: Request, res: Response) => {
  const { projectId, organizationId, testimonialId } = req.body;

  // Verify webhook secret
  const webhookSecret = req.headers['x-webhook-secret'];
  if (webhookSecret !== process.env.WEBHOOK_SECRET) {
    res.status(401).json({ error: 'Invalid webhook secret' });
    return;
  }

  try {
    console.log(`[Webhook] Testimonial approved: ${testimonialId}`);

    // Queue rebuild job
    await addRebuildJob({
      projectId,
      organizationId,
      trigger: 'testimonial_approved',
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Webhook for Supabase database changes
app.post('/webhooks/supabase', async (req: Request, res: Response) => {
  const { type, table, record } = req.body;

  // Verify webhook secret
  const webhookSecret = req.headers['x-webhook-secret'];
  if (webhookSecret !== process.env.SUPABASE_WEBHOOK_SECRET) {
    res.status(401).json({ error: 'Invalid webhook secret' });
    return;
  }

  try {
    console.log(`[Webhook] Supabase ${type} on ${table}`);

    // Handle testimonial status changes
    if (table === 'testimonials' && type === 'UPDATE') {
      if (record.status === 'approved') {
        await addRebuildJob({
          projectId: record.project_id,
          organizationId: record.organization_id,
          trigger: 'testimonial_approved',
        });
      }
    }

    // Handle new connections
    if (table === 'connections' && type === 'INSERT') {
      if (record.status === 'active') {
        await addScrapeJob({
          connectionId: record.id,
          organizationId: record.organization_id,
          priority: 'high', // New connections get priority
        });
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error handling Supabase webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// ============ Admin Endpoints ============

// Pause/resume queues (admin only)
app.post('/api/admin/queues/:action', authenticateRequest, async (req: Request, res: Response) => {
  const { action } = req.params;
  const { queue: queueName } = req.body;

  // TODO: Add admin role check

  try {
    const queues: Record<string, typeof scrapeQueue> = {
      scrape: scrapeQueue,
      analyze: analyzeQueue,
      notify: notifyQueue,
      rebuild: rebuildQueue,
    };

    const queue = queueName ? queues[queueName] : null;
    const targetQueues = queue ? [queue] : Object.values(queues);

    if (action === 'pause') {
      await Promise.all(targetQueues.map((q) => q.pause()));
      res.json({ success: true, message: `${queueName || 'All'} queue(s) paused` });
    } else if (action === 'resume') {
      await Promise.all(targetQueues.map((q) => q.resume()));
      res.json({ success: true, message: `${queueName || 'All'} queue(s) resumed` });
    } else {
      res.status(400).json({ error: 'Invalid action. Use "pause" or "resume"' });
    }
  } catch (error) {
    console.error('Error managing queues:', error);
    res.status(500).json({ error: 'Failed to manage queues' });
  }
});

// ============ Error Handling ============

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// ============ Server Start ============

export function startServer(): void {
  app.listen(PORT, () => {
    console.log(`🚀 Scraper service running on port ${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/health`);
  });
}

// Start if run directly
if (require.main === module) {
  startServer();
}

export default app;
