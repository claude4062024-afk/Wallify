/**
 * Scrapers Index
 * Barrel export for all platform scrapers
 */

export { BaseScraper } from './base';
export type { Platform, ScraperResult, ScraperConfig } from './base';

export { TwitterScraper } from './twitter';
export { LinkedInScraper } from './linkedin';
export { G2Scraper } from './g2';
export { ProductHuntScraper } from './producthunt';

import { BaseScraper, Platform } from './base';
import { TwitterScraper } from './twitter';
import { LinkedInScraper } from './linkedin';
import { G2Scraper } from './g2';
import { ProductHuntScraper } from './producthunt';

/**
 * Factory function to get scraper by platform
 */
export function getScraperForPlatform(platform: Platform): BaseScraper {
  switch (platform) {
    case 'twitter':
      return new TwitterScraper();
    case 'linkedin':
      return new LinkedInScraper();
    case 'g2':
      return new G2Scraper();
    case 'producthunt':
      return new ProductHuntScraper();
    default:
      throw new Error(`Unknown platform: ${platform}`);
  }
}

/**
 * Get all available scrapers
 */
export function getAllScrapers(): BaseScraper[] {
  return [
    new TwitterScraper(),
    new LinkedInScraper(),
    new G2Scraper(),
    new ProductHuntScraper(),
  ];
}
