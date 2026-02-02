/**
 * Base Scraper Class
 * All platform scrapers extend this base class
 * Provides rate limiting, retry logic, and common utilities
 */

import type { RawTestimonial, Connection } from '../lib/supabase';

export type Platform = 'twitter' | 'linkedin' | 'g2' | 'producthunt';

export interface ScraperResult {
  testimonials: RawTestimonial[];
  errors: string[];
  scrapedAt: Date;
}

export interface ScraperConfig {
  maxRetries: number;
  rateLimitMs: number;
  timeout: number;
}

const DEFAULT_CONFIG: ScraperConfig = {
  maxRetries: 3,
  rateLimitMs: 1000, // 1 request per second
  timeout: 30000, // 30 seconds
};

/**
 * Abstract base class for all platform scrapers
 * Implements common functionality: rate limiting, retries, error handling
 */
export abstract class BaseScraper {
  abstract platform: Platform;
  protected config: ScraperConfig;
  private lastRequestTime: number = 0;

  constructor(config: Partial<ScraperConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Main scraping method - implemented by each platform scraper
   */
  abstract scrape(connection: Connection): Promise<ScraperResult>;

  /**
   * Rate limiting - ensures minimum time between requests
   * Max 1 request per second per domain
   */
  protected async rateLimit(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    const waitTime = this.config.rateLimitMs - elapsed;

    if (waitTime > 0) {
      await this.delay(waitTime);
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Delay helper
   */
  protected delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Random delay for more human-like behavior
   * Range: 1-3 seconds
   */
  protected async randomDelay(): Promise<void> {
    const min = 1000;
    const max = 3000;
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await this.delay(delay);
  }

  /**
   * Retry wrapper with exponential backoff
   * Retries: 1min, 5min, 15min
   */
  protected async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = this.config.maxRetries
  ): Promise<T> {
    const backoffTimes = [60000, 300000, 900000]; // 1min, 5min, 15min

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        await this.rateLimit();
        return await fn();
      } catch (error) {
        const isLastAttempt = attempt === maxRetries;

        if (isLastAttempt) {
          throw error;
        }

        const backoff = backoffTimes[attempt] || backoffTimes[backoffTimes.length - 1];
        console.warn(
          `[${this.platform}] Attempt ${attempt + 1} failed, retrying in ${backoff / 1000}s:`,
          error instanceof Error ? error.message : error
        );

        await this.delay(backoff);
      }
    }

    throw new Error('Max retries exceeded');
  }

  /**
   * Format raw scraped data into testimonial format
   */
  protected formatTestimonial(data: {
    text: string;
    authorName: string;
    authorHandle?: string;
    authorAvatar?: string;
    authorTitle?: string;
    authorCompany?: string;
    externalId: string;
    externalUrl?: string;
    postedAt?: Date;
    metadata?: Record<string, unknown>;
  }): Omit<RawTestimonial, 'connectionId' | 'organizationId' | 'projectId'> {
    return {
      contentText: data.text,
      source: this.platform,
      authorName: data.authorName,
      authorHandle: data.authorHandle || null,
      authorAvatar: data.authorAvatar || null,
      authorTitle: data.authorTitle || null,
      authorCompany: data.authorCompany || null,
      externalId: data.externalId,
      externalUrl: data.externalUrl || null,
      postedAt: data.postedAt?.toISOString() || null,
      scrapedAt: new Date().toISOString(),
      metadata: data.metadata || null,
    };
  }

  /**
   * Validate connection has required credentials
   */
  protected validateConnection(connection: Connection): void {
    if (!connection.accessToken) {
      throw new Error(`Missing access token for ${this.platform} connection`);
    }
  }

  /**
   * Log scraping activity
   */
  protected log(message: string, data?: unknown): void {
    console.log(`[${this.platform}] ${message}`, data || '');
  }

  /**
   * Log error
   */
  protected logError(message: string, error: unknown): void {
    console.error(
      `[${this.platform}] ERROR: ${message}`,
      error instanceof Error ? error.message : error
    );
  }
}

export default BaseScraper;
