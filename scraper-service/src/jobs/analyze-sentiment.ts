/**
 * Analyze Sentiment Job
 * AI-powered analysis of testimonials: quality scoring, sentiment, tag extraction
 */

import type { Job } from 'bull';
import { AnalyzeJobData } from '../lib/queue';
import { getUnprocessedTestimonials, updateTestimonialAnalysis } from '../lib/supabase';
import { analyzeTestimonial } from '../lib/openai';

interface AnalysisResult {
  qualityScore: number;
  sentimentScore: number;
  tags: string[];
}

/**
 * Process an analyze job for a specific testimonial
 */
export async function processAnalyzeJob(job: Job<AnalyzeJobData>): Promise<void> {
  const { testimonialId, organizationId } = job.data;

  console.log(`[AnalyzeJob] Starting job ${job.id}`, { testimonialId });

  try {
    // Get unprocessed testimonials (we'll find our specific one)
    const testimonials = await getUnprocessedTestimonials(organizationId);
    
    // Find by external ID (since we pass that before DB insert)
    // In production, you'd query by DB ID after insert returns it
    const testimonial = testimonials.find(
      (t) => t.id === testimonialId || (t.metadata as Record<string, unknown>)?.externalId === testimonialId
    );

    if (!testimonial) {
      console.log(`[AnalyzeJob] Testimonial ${testimonialId} not found or already processed`);
      return;
    }

    // Run AI analysis
    console.log(`[AnalyzeJob] Analyzing testimonial ${testimonial.id}`);
    
    const analysis = await analyzeTestimonial(testimonial.content_text || '');

    // Update testimonial with analysis results
    await updateTestimonialAnalysis(testimonial.id, {
      qualityScore: analysis.qualityScore,
      sentimentScore: analysis.sentimentScore,
      tags: analysis.tags,
    });

    console.log(`[AnalyzeJob] Completed analysis for ${testimonial.id}`, {
      qualityScore: analysis.qualityScore,
      sentimentScore: analysis.sentimentScore,
      tagCount: analysis.tags.length,
    });

  } catch (error) {
    console.error(`[AnalyzeJob] Job ${job.id} failed:`, error);
    throw error;
  }
}

/**
 * Batch process all unprocessed testimonials for an organization
 */
export async function analyzeAllUnprocessed(organizationId: string): Promise<number> {
  console.log(`[AnalyzeJob] Processing all unprocessed testimonials for org ${organizationId}`);

  const testimonials = await getUnprocessedTestimonials(organizationId);
  
  console.log(`[AnalyzeJob] Found ${testimonials.length} unprocessed testimonials`);

  let processed = 0;

  for (const testimonial of testimonials) {
    try {
      const analysis = await analyzeTestimonial(testimonial.content_text || '');

      await updateTestimonialAnalysis(testimonial.id, {
        qualityScore: analysis.qualityScore,
        sentimentScore: analysis.sentimentScore,
        tags: analysis.tags,
      });

      processed++;

      // Rate limit to avoid hitting OpenAI limits
      await new Promise((resolve) => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`[AnalyzeJob] Failed to analyze testimonial ${testimonial.id}:`, error);
    }
  }

  console.log(`[AnalyzeJob] Processed ${processed}/${testimonials.length} testimonials`);
  
  return processed;
}

/**
 * Re-analyze a specific testimonial (for manual refresh)
 */
export async function reanalyzeTestimonial(
  testimonialId: string,
  contentText: string
): Promise<AnalysisResult> {
  console.log(`[AnalyzeJob] Re-analyzing testimonial ${testimonialId}`);

  const analysis = await analyzeTestimonial(contentText);

  await updateTestimonialAnalysis(testimonialId, {
    qualityScore: analysis.qualityScore,
    sentimentScore: analysis.sentimentScore,
    tags: analysis.tags,
  });

  return analysis;
}

export default { processAnalyzeJob, analyzeAllUnprocessed, reanalyzeTestimonial };
