/**
 * ProductHunt Scraper
 * Scrapes ProductHunt comments and upvotes
 * Uses GraphQL API (ProductHunt provides one)
 */

import axios from 'axios';
import { BaseScraper, ScraperResult, Platform } from './base';
import type { RawTestimonial, Connection } from '../lib/supabase';

interface ProductHuntComment {
  id: string;
  body: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    headline: string | null;
    profileImage: string | null;
    username: string;
  };
  votesCount: number;
  isVoter: boolean;
}

interface ProductHuntPost {
  id: string;
  name: string;
  slug: string;
  comments: {
    edges: Array<{
      node: ProductHuntComment;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
}

interface GraphQLResponse {
  data?: {
    post?: ProductHuntPost;
  };
  errors?: Array<{ message: string }>;
}

export class ProductHuntScraper extends BaseScraper {
  platform: Platform = 'producthunt';
  private apiUrl = 'https://api.producthunt.com/v2/api/graphql';

  /**
   * Scrape ProductHunt comments for a product
   */
  async scrape(connection: Connection): Promise<ScraperResult> {
    const testimonials: RawTestimonial[] = [];
    const errors: string[] = [];

    try {
      this.log('Starting ProductHunt scrape', { productSlug: connection.platformHandle });

      const productSlug = connection.platformHandle;
      if (!productSlug) {
        throw new Error('Product slug is required for ProductHunt scraping');
      }

      // Get API token
      const apiToken = connection.accessToken || process.env.PRODUCTHUNT_API_TOKEN;
      if (!apiToken) {
        throw new Error('ProductHunt API token is required');
      }

      // Fetch all comments with pagination
      const allComments = await this.fetchAllComments(productSlug, apiToken);

      this.log(`Fetched ${allComments.length} comments from ProductHunt`);

      // Format testimonials
      for (const comment of allComments) {
        const formatted = this.formatTestimonial({
          text: comment.body,
          authorName: comment.user.name,
          authorHandle: comment.user.username,
          authorAvatar: comment.user.profileImage || undefined,
          authorTitle: comment.user.headline || undefined,
          externalId: comment.id,
          externalUrl: `https://producthunt.com/posts/${productSlug}#comment-${comment.id}`,
          postedAt: new Date(comment.createdAt),
          metadata: {
            platform: 'producthunt',
            votesCount: comment.votesCount,
            isVoter: comment.isVoter,
          },
        });

        testimonials.push({
          ...formatted,
          connectionId: connection.id,
          organizationId: connection.organizationId,
          projectId: connection.projectId,
        } as RawTestimonial);
      }

      this.log(`Scraped ${testimonials.length} ProductHunt comments total`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logError('Failed to scrape ProductHunt', error);
      errors.push(message);
    }

    return {
      testimonials,
      errors,
      scrapedAt: new Date(),
    };
  }

  /**
   * Fetch all comments with pagination
   */
  private async fetchAllComments(
    productSlug: string,
    apiToken: string
  ): Promise<ProductHuntComment[]> {
    const allComments: ProductHuntComment[] = [];
    let cursor: string | null = null;
    let hasNextPage = true;

    while (hasNextPage) {
      await this.rateLimit();

      const result = await this.withRetry(async () => {
        return await this.fetchCommentsPage(productSlug, apiToken, cursor);
      });

      if (result.comments.length > 0) {
        allComments.push(...result.comments);
      }

      hasNextPage = result.hasNextPage;
      cursor = result.endCursor;

      // Safety limit
      if (allComments.length >= 500) {
        this.log('Reached comment limit (500)');
        break;
      }
    }

    return allComments;
  }

  /**
   * Fetch a single page of comments
   */
  private async fetchCommentsPage(
    productSlug: string,
    apiToken: string,
    cursor: string | null
  ): Promise<{ comments: ProductHuntComment[]; hasNextPage: boolean; endCursor: string | null }> {
    const query = `
      query GetProductComments($slug: String!, $after: String) {
        post(slug: $slug) {
          id
          name
          slug
          comments(first: 50, after: $after) {
            edges {
              node {
                id
                body
                createdAt
                votesCount
                user {
                  id
                  name
                  headline
                  profileImage
                  username
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    `;

    const response = await axios.post<GraphQLResponse>(
      this.apiUrl,
      {
        query,
        variables: {
          slug: productSlug,
          after: cursor,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Wallify Bot/1.0',
        },
        timeout: this.config.timeout,
      }
    );

    if (response.data.errors) {
      throw new Error(response.data.errors.map((e) => e.message).join(', '));
    }

    const post = response.data.data?.post;
    if (!post) {
      throw new Error(`Product not found: ${productSlug}`);
    }

    const comments = post.comments.edges.map((edge) => edge.node);
    const { hasNextPage, endCursor } = post.comments.pageInfo;

    return {
      comments,
      hasNextPage,
      endCursor,
    };
  }
}

export default ProductHuntScraper;
