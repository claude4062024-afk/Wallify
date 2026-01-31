/**
 * Data Validation Utilities
 * Validates scraped data before saving to database
 */

import type { RawTestimonial } from '../lib/supabase';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a raw testimonial before saving
 */
export function validateTestimonial(testimonial: Partial<RawTestimonial>): ValidationResult {
  const errors: string[] = [];

  // Required fields
  if (!testimonial.contentText || testimonial.contentText.trim().length === 0) {
    errors.push('Content text is required');
  }

  if (!testimonial.authorName || testimonial.authorName.trim().length === 0) {
    errors.push('Author name is required');
  }

  if (!testimonial.externalId) {
    errors.push('External ID is required');
  }

  if (!testimonial.source) {
    errors.push('Source platform is required');
  }

  if (!testimonial.connectionId) {
    errors.push('Connection ID is required');
  }

  if (!testimonial.organizationId) {
    errors.push('Organization ID is required');
  }

  if (!testimonial.projectId) {
    errors.push('Project ID is required');
  }

  // Content length limits
  if (testimonial.contentText && testimonial.contentText.length > 10000) {
    errors.push('Content text exceeds maximum length (10,000 characters)');
  }

  if (testimonial.authorName && testimonial.authorName.length > 255) {
    errors.push('Author name exceeds maximum length (255 characters)');
  }

  // Valid source platforms
  const validSources = ['twitter', 'linkedin', 'g2', 'producthunt', 'direct', 'email', 'video'];
  if (testimonial.source && !validSources.includes(testimonial.source)) {
    errors.push(`Invalid source platform: ${testimonial.source}`);
  }

  // URL validation
  if (testimonial.externalUrl && !isValidUrl(testimonial.externalUrl)) {
    errors.push('Invalid external URL');
  }

  if (testimonial.authorAvatar && !isValidUrl(testimonial.authorAvatar)) {
    errors.push('Invalid author avatar URL');
  }

  // Date validation
  if (testimonial.postedAt && !isValidDate(testimonial.postedAt)) {
    errors.push('Invalid posted date');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate a URL string
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate a date string
 */
export function isValidDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * Sanitize text content
 * Removes potentially harmful content while preserving legitimate text
 */
export function sanitizeText(text: string): string {
  return text
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove potential XSS patterns
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Trim
    .trim();
}

/**
 * Sanitize author name
 */
export function sanitizeAuthorName(name: string): string {
  return name
    // Remove HTML
    .replace(/<[^>]*>/g, '')
    // Remove special characters except allowed ones
    .replace(/[^\w\s\-'.]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Trim
    .trim()
    // Limit length
    .substring(0, 255);
}

/**
 * Validate and sanitize a batch of testimonials
 * Returns only valid testimonials
 */
export function validateAndSanitizeBatch(
  testimonials: Partial<RawTestimonial>[]
): { valid: RawTestimonial[]; invalid: { testimonial: Partial<RawTestimonial>; errors: string[] }[] } {
  const valid: RawTestimonial[] = [];
  const invalid: { testimonial: Partial<RawTestimonial>; errors: string[] }[] = [];

  for (const testimonial of testimonials) {
    // Sanitize
    if (testimonial.contentText) {
      testimonial.contentText = sanitizeText(testimonial.contentText);
    }
    if (testimonial.authorName) {
      testimonial.authorName = sanitizeAuthorName(testimonial.authorName);
    }

    // Validate
    const result = validateTestimonial(testimonial);

    if (result.valid) {
      valid.push(testimonial as RawTestimonial);
    } else {
      invalid.push({ testimonial, errors: result.errors });
    }
  }

  return { valid, invalid };
}

export default {
  validateTestimonial,
  isValidUrl,
  isValidDate,
  sanitizeText,
  sanitizeAuthorName,
  validateAndSanitizeBatch,
};
