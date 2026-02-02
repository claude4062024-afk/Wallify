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
  connectionId: string
  organizationId: string
  projectId: string
  contentText: string
  authorName: string
  authorHandle?: string | null
  authorTitle?: string | null
  authorCompany?: string | null
  authorAvatar?: string | null
  source: 'twitter' | 'linkedin' | 'g2' | 'producthunt' | 'capterra' | 'trustpilot' | 'direct' | 'email' | 'video'
  externalUrl?: string | null
  externalId: string
  rating?: number | null
  postedAt?: string | null
  scrapedAt: string
  metadata?: Record<string, unknown> | null
}

export interface Connection {
  id: string
  organizationId: string
  projectId: string
  platform: string
  platformHandle: string | null
  accountId: string | null
  accountName: string | null
  accessToken: string | null
  refreshToken: string | null
  status: 'active' | 'inactive' | 'pending' | 'error' | 'scraping'
  lastScrapedAt: string | null
  metadata: Record<string, unknown> | null
}

/**
 * Fetch all active connections for scraping
 */
export async function getActiveConnections(organizationId?: string): Promise<Connection[]> {
  let query = supabase
    .from('connections')
    .select('*')
    .eq('status', 'active')

  if (organizationId) {
    query = query.eq('organization_id', organizationId)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)

  const rows = (data || []) as Database['public']['Tables']['connections']['Row'][]

  return rows.map((row) => ({
    id: row.id,
    organizationId: row.organization_id,
    projectId: row.project_id,
    platform: row.platform,
    platformHandle: row.platform_handle ?? null,
    accountId: row.account_id ?? null,
    accountName: row.account_name ?? null,
    accessToken: row.access_token ?? null,
    refreshToken: row.refresh_token ?? null,
    status: row.status,
    lastScrapedAt: row.last_scraped_at ?? null,
    metadata: row.metadata ?? null,
  }))
}

/**
 * Save raw testimonials to database
 */
export async function saveTestimonials(
  testimonials: RawTestimonial[]
): Promise<number> {
  const inserts = testimonials.map(t => ({
    organization_id: t.organizationId,
    project_id: t.projectId,
    content_text: t.contentText,
    author_name: t.authorName,
    author_handle: t.authorHandle || null,
    author_title: t.authorTitle || null,
    author_company: t.authorCompany || null,
    author_avatar: t.authorAvatar || null,
    source: t.source,
    source_url: t.externalUrl || null,
    source_id: t.externalId,
    rating: t.rating || null,
    metadata: t.metadata || null,
    status: 'pending' as const,
    verification_status: 'unverified' as const,
    created_at: t.scrapedAt,
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
  status: 'active' | 'inactive' | 'error' | 'pending' | 'scraping',
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
export async function getUnprocessedTestimonials(
  organizationId?: string,
  limit = 50
): Promise<Array<{ id: string; content_text: string | null; metadata: Record<string, unknown> | null }>> {
  let query = supabase
    .from('testimonials')
    .select('id, content_text, metadata')
    .is('quality_score', null)
    .not('content_text', 'is', null)

  if (organizationId) {
    query = query.eq('organization_id', organizationId)
  }

  const { data, error } = await query.limit(limit)

  if (error) throw new Error(error.message)
  return data
}

/**
 * Update testimonial with AI analysis
 */
export async function updateTestimonialAnalysis(
  id: string,
  analysis: {
    qualityScore: number
    sentimentScore: number
    tags: string[]
  }
): Promise<void> {
  const { error } = await supabase
    .from('testimonials')
    .update({
      quality_score: analysis.qualityScore,
      sentiment_score: analysis.sentimentScore,
      tags: analysis.tags,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

/**
 * Check if testimonial already exists (by source_id)
 */
export async function testimonialExists(externalId: string, source: string): Promise<boolean> {
  const { data } = await supabase
    .from('testimonials')
    .select('id')
    .eq('source_id', externalId)
    .eq('source', source as Database['public']['Tables']['testimonials']['Row']['source'])
    .limit(1)
    .single()

  return !!data
}
