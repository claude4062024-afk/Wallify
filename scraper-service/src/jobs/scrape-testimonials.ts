/**
 * Scrape Testimonials Job
 * Main job processor for scraping testimonials from connected platforms
 */

import type { Job } from 'bull';
import { ScrapeJobData, addNotifyJob } from '../lib/queue';
import { 
  getActiveConnections, 
  saveTestimonials, 
  updateConnectionLastScraped,
  updateConnectionStatus,
  testimonialExists 
} from '../lib/supabase';
import { getScraperForPlatform, Platform } from '../scrapers';
import { shouldRejectTestimonial, calculateTrustScore, Author } from '../utils/filters';
import { validateAndSanitizeBatch } from '../utils/validators';
import type { RawTestimonial } from '../lib/supabase';

/**
 * Process a scrape job for a specific connection
 */
export async function processScrapeJob(job: Job<ScrapeJobData>): Promise<void> {
  const { connectionId, organizationId, priority } = job.data;

  console.log(`[ScrapeJob] Starting job ${job.id}`, { connectionId, priority });

  try {
    // Get the connection details
    const connections = await getActiveConnections(organizationId);
    const connection = connections.find((c) => c.id === connectionId);

    if (!connection) {
      throw new Error(`Connection not found: ${connectionId}`);
    }

    // Update connection status to scraping
    await updateConnectionStatus(connectionId, 'scraping');

    // Get the appropriate scraper
    const platform = connection.platform as Platform;
    const scraper = getScraperForPlatform(platform);

    // Run the scraper
    console.log(`[ScrapeJob] Scraping ${platform} for connection ${connectionId}`);
    const result = await scraper.scrape(connection);

    // Log any errors
    if (result.errors.length > 0) {
      console.warn(`[ScrapeJob] Scraper reported errors:`, result.errors);
    }

    // Filter out duplicates
    const newTestimonials: RawTestimonial[] = [];
    for (const testimonial of result.testimonials) {
      const exists = await testimonialExists(
        testimonial.externalId,
        testimonial.source
      );
      if (!exists) {
        newTestimonials.push(testimonial);
      }
    }

    console.log(`[ScrapeJob] Found ${newTestimonials.length} new testimonials (${result.testimonials.length - newTestimonials.length} duplicates filtered)`);

    // Filter spam
    const filteredTestimonials: RawTestimonial[] = [];
    for (const testimonial of newTestimonials) {
      const author: Author = {
        name: testimonial.authorName,
        handle: testimonial.authorHandle || undefined,
      };

      const filterResult = shouldRejectTestimonial(testimonial.contentText, author);

      if (!filterResult.reject) {
        // Calculate trust score
        const trustScore = calculateTrustScore(testimonial.contentText, author);
        
        filteredTestimonials.push({
          ...testimonial,
          metadata: {
            ...(testimonial.metadata as Record<string, unknown> || {}),
            trustScore,
          },
        });
      } else {
        console.log(`[ScrapeJob] Rejected testimonial: ${filterResult.reason}`, {
          author: testimonial.authorName,
          preview: testimonial.contentText.substring(0, 50),
        });
      }
    }

    console.log(`[ScrapeJob] ${filteredTestimonials.length} testimonials passed spam filter`);

    // Validate and sanitize
    const { valid, invalid } = validateAndSanitizeBatch(filteredTestimonials);

    if (invalid.length > 0) {
      console.warn(`[ScrapeJob] ${invalid.length} testimonials failed validation:`, 
        invalid.map((i) => i.errors)
      );
    }

    // Save valid testimonials
    if (valid.length > 0) {
      await saveTestimonials(valid);
      console.log(`[ScrapeJob] Saved ${valid.length} testimonials`);

      // P2 DORMANT - AI analysis jobs disabled
      // Queue analysis jobs for each testimonial
      // for (const testimonial of valid) {
      //   await addAnalyzeJob({
      //     testimonialId: testimonial.externalId,
      //     organizationId,
      //   });
      // }
      console.log(`[ScrapeJob] AI analysis skipped (P2 dormant)`);

      // Queue notification if new testimonials found
      await addNotifyJob({
        organizationId,
        type: 'new_testimonials',
        data: {
          count: valid.length,
          platform,
        },
      });
    }

    // Update connection last scraped time
    await updateConnectionLastScraped(connectionId);
    await updateConnectionStatus(connectionId, 'active');

    console.log(`[ScrapeJob] Completed job ${job.id}`);

  } catch (error) {
    console.error(`[ScrapeJob] Job ${job.id} failed:`, error);

    // Update connection status to error
    await updateConnectionStatus(connectionId, 'error').catch(() => {});

    throw error;
  }
}

/**
 * Process all active connections for an organization
 */
export async function scrapeAllConnections(organizationId: string): Promise<void> {
  console.log(`[ScrapeJob] Scraping all connections for org ${organizationId}`);

  const connections = await getActiveConnections(organizationId);

  console.log(`[ScrapeJob] Found ${connections.length} active connections`);

  for (const connection of connections) {
    try {
      const platform = connection.platform as Platform;
      const scraper = getScraperForPlatform(platform);
      
      await updateConnectionStatus(connection.id, 'scraping');
      
      const result = await scraper.scrape(connection);

      // Filter and save (simplified for bulk processing)
      const newTestimonials: RawTestimonial[] = [];
      for (const testimonial of result.testimonials) {
        const exists = await testimonialExists(testimonial.externalId, testimonial.source);
        if (!exists) {
          const author: Author = {
            name: testimonial.authorName,
            handle: testimonial.authorHandle || undefined,
          };
          const filterResult = shouldRejectTestimonial(testimonial.contentText, author);
          if (!filterResult.reject) {
            newTestimonials.push(testimonial);
          }
        }
      }

      if (newTestimonials.length > 0) {
        const { valid } = validateAndSanitizeBatch(newTestimonials);
        if (valid.length > 0) {
          await saveTestimonials(valid);
        }
      }

      await updateConnectionLastScraped(connection.id);
      await updateConnectionStatus(connection.id, 'active');

    } catch (error) {
      console.error(`[ScrapeJob] Failed to scrape connection ${connection.id}:`, error);
      await updateConnectionStatus(connection.id, 'error').catch(() => {});
    }
  }
}

export default { processScrapeJob, scrapeAllConnections };
