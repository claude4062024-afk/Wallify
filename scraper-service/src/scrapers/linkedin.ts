/**
 * LinkedIn Scraper
 * Scrapes company page recommendations and posts mentioning the company
 * Uses Playwright for better anti-bot evasion
 */

import { chromium, Browser, Page } from 'playwright';
import { BaseScraper, ScraperResult, Platform } from './base';
import type { RawTestimonial, Connection } from '../lib/supabase';

interface LinkedInPostData {
  text: string | null;
  authorName: string | null;
  authorTitle: string | null;
  authorCompany: string | null;
  authorAvatar: string | null;
  postId: string | null;
  timestamp: string | null;
}

export class LinkedInScraper extends BaseScraper {
  platform: Platform = 'linkedin';
  private browser: Browser | null = null;

  constructor() {
    super({
      rateLimitMs: 2000, // LinkedIn is more aggressive with rate limiting
      timeout: 45000,
    });
  }

  /**
   * Scrape LinkedIn for posts and recommendations
   */
  async scrape(connection: Connection): Promise<ScraperResult> {
    this.validateConnection(connection);

    const testimonials: RawTestimonial[] = [];
    const errors: string[] = [];

    try {
      this.log('Starting LinkedIn scrape', { handle: connection.platformHandle });

      // Launch browser with stealth settings
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--disable-blink-features=AutomationControlled',
        ],
      });

      // Create context with realistic profile
      const context = await this.browser.newContext({
        viewport: { width: 1280, height: 800 },
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        locale: 'en-US',
        timezoneId: 'America/New_York',
      });

      const page = await context.newPage();

      // Login with credentials
      await this.login(page, connection);

      // Scrape company mentions
      const posts = await this.withRetry(async () => {
        return await this.scrapeMentions(page, connection.platformHandle!);
      });

      // Format testimonials
      for (const post of posts) {
        if (post.text && post.authorName && post.postId) {
          const formatted = this.formatTestimonial({
            text: post.text,
            authorName: post.authorName,
            authorTitle: post.authorTitle || undefined,
            authorCompany: post.authorCompany || undefined,
            authorAvatar: post.authorAvatar || undefined,
            externalId: post.postId,
            externalUrl: `https://linkedin.com/feed/update/${post.postId}`,
            postedAt: post.timestamp ? new Date(post.timestamp) : undefined,
            metadata: { platform: 'linkedin' },
          });

          testimonials.push({
            ...formatted,
            connectionId: connection.id,
            organizationId: connection.organizationId,
            projectId: connection.projectId,
          } as RawTestimonial);
        }
      }

      this.log(`Scraped ${testimonials.length} LinkedIn posts`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logError('Failed to scrape LinkedIn', error);
      errors.push(message);
    } finally {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
    }

    return {
      testimonials,
      errors,
      scrapedAt: new Date(),
    };
  }

  /**
   * Login to LinkedIn
   */
  private async login(page: Page, connection: Connection): Promise<void> {
    this.log('Attempting LinkedIn login...');

    // Navigate to LinkedIn
    await page.goto('https://www.linkedin.com', {
      waitUntil: 'networkidle',
      timeout: this.config.timeout,
    });

    // Set authentication cookies
    // In production, use proper OAuth flow
    if (connection.accessToken) {
      await page.context().addCookies([
        {
          name: 'li_at',
          value: connection.accessToken,
          domain: '.linkedin.com',
          path: '/',
          secure: true,
          httpOnly: true,
        },
      ]);
    }

    // Navigate to feed to verify login
    await page.goto('https://www.linkedin.com/feed/', {
      waitUntil: 'networkidle',
      timeout: this.config.timeout,
    });

    await this.randomDelay();

    this.log('LinkedIn login successful');
  }

  /**
   * Scrape mentions of company
   */
  private async scrapeMentions(page: Page, companyName: string): Promise<LinkedInPostData[]> {
    // Search for company mentions
    const searchUrl = `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(companyName)}&origin=GLOBAL_SEARCH_HEADER`;

    await page.goto(searchUrl, {
      waitUntil: 'networkidle',
      timeout: this.config.timeout,
    });

    // Wait for posts to load
    await page.waitForSelector('.feed-shared-update-v2', {
      timeout: 10000,
    }).catch(() => {
      this.log('No posts found or selector changed');
    });

    await this.randomDelay();

    // Scroll to load more posts
    await this.scrollPage(page, 3);

    // Extract post data
    const posts = await page.evaluate(() => {
      const doc = (globalThis as any).document;
      const postElements = doc ? Array.from(doc.querySelectorAll('.feed-shared-update-v2')) : [];

      return postElements.map((el: any) => {
        // Get post text
        const textEl = el.querySelector('.feed-shared-text');
        const text = textEl?.textContent?.trim() || null;

        // Get author info
        const authorEl = el.querySelector('.update-components-actor');
        const nameEl = authorEl?.querySelector('.update-components-actor__name');
        const titleEl = authorEl?.querySelector('.update-components-actor__description');
        const avatarEl = authorEl?.querySelector('img');

        // Get post ID from data attribute or URL
        const postId = el.getAttribute('data-urn') ||
          el.querySelector('a[href*="/feed/update/"]')?.getAttribute('href')?.match(/urn:li:activity:(\d+)/)?.[1];

        // Parse title for job title and company
        const titleText = titleEl?.textContent?.trim() || '';
        const titleParts = titleText.split(' at ');
        const authorTitle = titleParts[0] || null;
        const authorCompany = titleParts[1] || null;

        return {
          text,
          authorName: nameEl?.textContent?.trim() || null,
          authorTitle,
          authorCompany,
          authorAvatar: avatarEl?.getAttribute('src') || null,
          postId: postId || null,
          timestamp: null, // LinkedIn timestamps are relative, harder to parse
        };
      });
    });

    return posts.filter((p) => p.postId !== null && p.text !== null);
  }

  /**
   * Scroll page to load more content
   */
  private async scrollPage(page: Page, scrollCount: number): Promise<void> {
    for (let i = 0; i < scrollCount; i++) {
      await page.evaluate(() => {
        const win = (globalThis as any).window;
        if (win?.scrollBy) {
          win.scrollBy(0, win.innerHeight);
        }
      });
      await this.delay(2000); // Longer delay for LinkedIn
    }
  }
}

export default LinkedInScraper;
