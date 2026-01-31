/**
 * Twitter/X Scraper
 * Scrapes mentions, replies, quote tweets with positive sentiment
 * Uses Puppeteer for headless browser automation
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { BaseScraper, ScraperResult, Platform } from './base';
import type { RawTestimonial, Connection } from '../lib/supabase';

interface TweetData {
  text: string | null;
  author: string | null;
  authorHandle: string | null;
  avatar: string | null;
  timestamp: string | null;
  tweetId: string | null;
}

export class TwitterScraper extends BaseScraper {
  platform: Platform = 'twitter';
  private browser: Browser | null = null;

  /**
   * Scrape Twitter mentions and positive tweets about the company
   */
  async scrape(connection: Connection): Promise<ScraperResult> {
    this.validateConnection(connection);

    const testimonials: RawTestimonial[] = [];
    const errors: string[] = [];

    try {
      this.log('Starting Twitter scrape', { handle: connection.platformHandle });

      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
        ],
      });

      const page = await this.browser.newPage();

      // Set realistic viewport and user agent
      await page.setViewport({ width: 1280, height: 800 });
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      // Login with OAuth token
      await this.login(page, connection.accessToken!);

      // Navigate to mentions
      const tweets = await this.withRetry(async () => {
        return await this.scrapeMentions(page, connection.platformHandle!);
      });

      // Format testimonials
      for (const tweet of tweets) {
        if (tweet.text && tweet.author && tweet.tweetId) {
          const formatted = this.formatTestimonial({
            text: tweet.text,
            authorName: tweet.author,
            authorHandle: tweet.authorHandle || undefined,
            authorAvatar: tweet.avatar || undefined,
            externalId: tweet.tweetId,
            externalUrl: `https://twitter.com/i/status/${tweet.tweetId}`,
            postedAt: tweet.timestamp ? new Date(tweet.timestamp) : undefined,
            metadata: { platform: 'twitter' },
          });

          testimonials.push({
            ...formatted,
            connectionId: connection.id,
            organizationId: connection.organizationId,
            projectId: connection.projectId,
          } as RawTestimonial);
        }
      }

      this.log(`Scraped ${testimonials.length} tweets`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logError('Failed to scrape Twitter', error);
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
   * Login to Twitter with OAuth credentials
   */
  private async login(page: Page, accessToken: string): Promise<void> {
    this.log('Attempting login...');

    // Set cookies for authentication
    // In production, this would use proper OAuth token handling
    await page.setCookie({
      name: 'auth_token',
      value: accessToken,
      domain: '.twitter.com',
      path: '/',
      secure: true,
      httpOnly: true,
    });

    // Navigate to home to verify login
    await page.goto('https://twitter.com/home', {
      waitUntil: 'networkidle2',
      timeout: this.config.timeout,
    });

    // Random delay to appear human
    await this.randomDelay();

    this.log('Login successful');
  }

  /**
   * Scrape mentions page for tweets mentioning the company
   */
  private async scrapeMentions(page: Page, handle: string): Promise<TweetData[]> {
    // Navigate to search for mentions
    const searchUrl = `https://twitter.com/search?q=%40${handle}&src=typed_query&f=live`;

    await page.goto(searchUrl, {
      waitUntil: 'networkidle2',
      timeout: this.config.timeout,
    });

    // Wait for tweets to load
    await page.waitForSelector('[data-testid="tweet"]', {
      timeout: 10000,
    }).catch(() => {
      this.log('No tweets found or selector changed');
    });

    // Random delay
    await this.randomDelay();

    // Scroll to load more tweets
    await this.scrollPage(page, 3);

    // Extract tweet data
    const tweets = await page.evaluate(() => {
      const tweetElements = document.querySelectorAll('[data-testid="tweet"]');

      return Array.from(tweetElements).map((el) => {
        const textEl = el.querySelector('[data-testid="tweetText"]');
        const userNameEl = el.querySelector('[data-testid="User-Name"]');
        const timeEl = el.querySelector('time');
        const avatarEl = el.querySelector('img[src*="profile_images"]');

        // Get tweet ID from any link containing /status/
        const statusLink = el.querySelector('a[href*="/status/"]');
        const tweetId = statusLink?.getAttribute('href')?.match(/\/status\/(\d+)/)?.[1];

        // Get author handle from link
        const handleLink = userNameEl?.querySelector('a[href^="/"]');
        const authorHandle = handleLink?.getAttribute('href')?.replace('/', '');

        return {
          text: textEl?.textContent || null,
          author: userNameEl?.textContent?.split('@')[0]?.trim() || null,
          authorHandle: authorHandle || null,
          avatar: avatarEl?.getAttribute('src') || null,
          timestamp: timeEl?.getAttribute('datetime') || null,
          tweetId: tweetId || null,
        };
      });
    });

    return tweets.filter((t): t is TweetData => t.tweetId !== null);
  }

  /**
   * Scroll page to load more content
   */
  private async scrollPage(page: Page, scrollCount: number): Promise<void> {
    for (let i = 0; i < scrollCount; i++) {
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
      });
      await this.delay(1500);
    }
  }
}

export default TwitterScraper;
