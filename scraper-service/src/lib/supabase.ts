/**
 * Supabase Client for Scraper Service
 * Following Skill.md Database Interaction Standards
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from './types.js'

if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL is required')
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
}

// Use service role key for backend operations (bypasses RLS)
export const supabase = createClient<Database>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Types for testimonials
export interface RawTestimonial {
  content_text: string
  author_name: string
  author_title?: string | null
  author_company?: string | null
  author_avatar?: string | null
  source: 'twitter' | 'linkedin' | 'g2' | 'producthunt' | 'capterra' | 'trustpilot'
  source_url?: string | null
  source_id?: string | null
  rating?: number | null
  scraped_at: string
}

export interface Connection {
  id: string
  project_id: string
  platform: string
  account_id: string | null
  account_name: string | null
  access_token: string | null
  refresh_token: string | null
  status: string
  last_scraped_at: string | null
  metadata: Record<string, unknown> | null
}

/**
 * Fetch all active connections for scraping
 */
export async function getActiveConnections(): Promise<Connection[]> {
  const { data, error } = await supabase
    .from('connections')
    .select('*')
    .eq('status', 'active')

  if (error) throw new Error(error.message)
  return data as Connection[]
}

/**
 * Save raw testimonials to database
 */
export async function saveTestimonials(
  projectId: string,
  testimonials: RawTestimonial[]
): Promise<number> {
  const inserts = testimonials.map(t => ({
    project_id: projectId,
    content_text: t.content_text,
    author_name: t.author_name,
    author_title: t.author_title || null,
    author_company: t.author_company || null,
    author_avatar: t.author_avatar || null,
    source: t.source,
    source_url: t.source_url || null,
    source_id: t.source_id || null,
    rating: t.rating || null,
    status: 'pending' as const,
    verification_status: 'unverified' as const,
  }))

  const { data, error } = await supabase
    .from('testimonials')
    .insert(inserts)
    .select('id')

  if (error) throw new Error(error.message)
  return data.length
}

/**
 * Update connection after scraping
 */
export async function updateConnectionLastScraped(connectionId: string): Promise<void> {
  const { error } = await supabase
    .from('connections')
    .update({ 
      last_scraped_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', connectionId)

  if (error) throw new Error(error.message)
}

/**
 * Update connection status
 */
export async function updateConnectionStatus(
  connectionId: string, 
  status: 'active' | 'inactive' | 'error' | 'pending',
  errorMessage?: string
): Promise<void> {
  const { error } = await supabase
    .from('connections')
    .update({ 
      status,
      updated_at: new Date().toISOString(),
      ...(errorMessage && { metadata: { error: errorMessage } })
    })
    .eq('id', connectionId)

  if (error) throw new Error(error.message)
}

/**
 * Get testimonials for AI processing
 */
export async function getUnprocessedTestimonials(limit = 50): Promise<Array<{ id: string; content_text: string }>> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('id, content_text')
    .is('quality_score', null)
    .not('content_text', 'is', null)
    .limit(limit)

  if (error) throw new Error(error.message)
  return data
}

/**
 * Update testimonial with AI analysis
 */
export async function updateTestimonialAnalysis(
  id: string,
  analysis: {
    quality_score: number
    sentiment_score: number
    tags: string[]
  }
): Promise<void> {
  const { error } = await supabase
    .from('testimonials')
    .update({
      quality_score: analysis.quality_score,
      sentiment_score: analysis.sentiment_score,
      tags: analysis.tags,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

/**
 * Check if testimonial already exists (by source_id)
 */
export async function testimonialExists(sourceId: string, source: string): Promise<boolean> {
  const { data } = await supabase
    .from('testimonials')
    .select('id')
    .eq('source_id', sourceId)
    .eq('source', source)
    .limit(1)
    .single()

  return !!data
}
