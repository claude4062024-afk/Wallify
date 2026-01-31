/**
 * G2 Scraper
 * Scrapes G2 reviews for a product
 * Uses Axios + Cheerio (faster than browser, G2 is less aggressive with bots)
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseScraper, ScraperResult, Platform } from './base';
import type { RawTestimonial, Connection } from '../lib/supabase';

interface G2ReviewData {
  text: string;
  authorName: string;
  authorTitle: string | null;
  authorCompany: string | null;
  authorAvatar: string | null;
  reviewId: string;
  rating: number;
  timestamp: string | null;
  verifiedUser: boolean;
}

export class G2Scraper extends BaseScraper {
  platform: Platform = 'g2';
  private baseUrl = 'https://www.g2.com';

  /**
   * Scrape G2 reviews for a product
   */
  async scrape(connection: Connection): Promise<ScraperResult> {
    const testimonials: RawTestimonial[] = [];
    const errors: string[] = [];

    try {
      this.log('Starting G2 scrape', { productSlug: connection.platformHandle });

      const productSlug = connection.platformHandle;
      if (!productSlug) {
        throw new Error('Product slug is required for G2 scraping');
      }

      // Scrape multiple pages of reviews
      const maxPages = 5;
      let allReviews: G2ReviewData[] = [];

      for (let page = 1; page <= maxPages; page++) {
        const reviews = await this.withRetry(async () => {
          return await this.scrapeReviewsPage(productSlug, page);
        });

        if (reviews.length === 0) {
          break; // No more reviews
        }

        allReviews = [...allReviews, ...reviews];
        this.log(`Scraped page ${page}, found ${reviews.length} reviews`);
      }

      // Format testimonials
      for (const review of allReviews) {
        const formatted = this.formatTestimonial({
          text: review.text,
          authorName: review.authorName,
          authorTitle: review.authorTitle || undefined,
          authorCompany: review.authorCompany || undefined,
          authorAvatar: review.authorAvatar || undefined,
          externalId: review.reviewId,
          externalUrl: `${this.baseUrl}/products/${productSlug}/reviews#review-${review.reviewId}`,
          postedAt: review.timestamp ? new Date(review.timestamp) : undefined,
          metadata: {
            platform: 'g2',
            rating: review.rating,
            verifiedUser: review.verifiedUser,
          },
        });

        testimonials.push({
          ...formatted,
          connectionId: connection.id,
          organizationId: connection.organizationId,
          projectId: connection.projectId,
        } as RawTestimonial);
      }

      this.log(`Scraped ${testimonials.length} G2 reviews total`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logError('Failed to scrape G2', error);
      errors.push(message);
    }

    return {
      testimonials,
      errors,
      scrapedAt: new Date(),
    };
  }

  /**
   * Scrape a single page of reviews
   */
  private async scrapeReviewsPage(productSlug: string, page: number): Promise<G2ReviewData[]> {
    await this.rateLimit();

    const url = `${this.baseUrl}/products/${productSlug}/reviews?page=${page}`;

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Wallify Bot/1.0 (+https://wallify.com/bot)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: this.config.timeout,
    });

    const $ = cheerio.load(response.data);
    const reviews: G2ReviewData[] = [];

    // Parse each review
    $('.review').each((_, element) => {
      const $review = $(element);

      // Get review ID
      const reviewId = $review.attr('data-review-id') ||
        $review.attr('id')?.replace('review-', '') ||
        `g2-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Get review text (likes + dislikes combined, or just main review)
      const whatLike = $review.find('[data-test="review-like"]').text().trim();
      const whatDislike = $review.find('[data-test="review-dislike"]').text().trim();
      const mainText = $review.find('.review-content').text().trim();

      let text = mainText;
      if (whatLike) {
        text = whatLike;
      }

      if (!text) return; // Skip if no text

      // Get author info
      const authorName = $review.find('.reviewer-info .name').text().trim() ||
        $review.find('[data-test="reviewer-name"]').text().trim() ||
        'Anonymous';

      const authorDetails = $review.find('.reviewer-info .title').text().trim() ||
        $review.find('[data-test="reviewer-title"]').text().trim();

      // Parse author title and company
      let authorTitle: string | null = null;
      let authorCompany: string | null = null;

      if (authorDetails) {
        const parts = authorDetails.split(' at ');
        if (parts.length === 2) {
          authorTitle = parts[0].trim();
          authorCompany = parts[1].trim();
        } else {
          authorTitle = authorDetails;
        }
      }

      // Get avatar
      const authorAvatar = $review.find('.reviewer-photo img').attr('src') ||
        $review.find('[data-test="reviewer-avatar"]').attr('src') ||
        null;

      // Get rating (stars)
      const ratingEl = $review.find('.stars');
      const ratingClass = ratingEl.attr('class') || '';
      const ratingMatch = ratingClass.match(/stars-(\d+)/);
      const rating = ratingMatch ? parseInt(ratingMatch[1], 10) : 5;

      // Get timestamp
      const timestamp = $review.find('time').attr('datetime') ||
        $review.find('[data-test="review-date"]').text().trim() ||
        null;

      // Check if verified
      const verifiedUser = $review.find('.verified-badge').length > 0 ||
        $review.find('[data-test="verified"]').length > 0;

      reviews.push({
        text,
        authorName,
        authorTitle,
        authorCompany,
        authorAvatar,
        reviewId,
        rating,
        timestamp,
        verifiedUser,
      });
    });

    return reviews;
  }
}

export default G2Scraper;
