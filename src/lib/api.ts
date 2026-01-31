// API Client for Backend Services
// Following Skill.md standards for API interactions

import { API_ENDPOINTS } from './constants'

interface ApiResponse<T> {
  data: T | null
  error: string | null
  status: number
}

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        data: null,
        error: data.message || data.error || 'Request failed',
        status: response.status,
      }
    }

    return {
      data,
      error: null,
      status: response.status,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network error'
    return {
      data: null,
      error: message,
      status: 0,
    }
  }
}

// ============================================
// SCRAPER SERVICE API
// ============================================

export interface ScrapeRequest {
  connectionId: string
  platform: 'twitter' | 'linkedin' | 'g2' | 'producthunt'
}

export interface ScrapeJob {
  id: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number
  testimonialsFound: number
  error?: string
}

/**
 * Trigger a scrape job for a social connection
 */
export async function triggerScrapeJob(
  request: ScrapeRequest
): Promise<ApiResponse<ScrapeJob>> {
  return apiFetch<ScrapeJob>(`${API_ENDPOINTS.SCRAPER_SERVICE}/api/scrape`, {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

/**
 * Get scrape job status
 */
export async function getScrapeJobStatus(
  jobId: string
): Promise<ApiResponse<ScrapeJob>> {
  return apiFetch<ScrapeJob>(
    `${API_ENDPOINTS.SCRAPER_SERVICE}/api/scrape/${jobId}`
  )
}

/**
 * Cancel a running scrape job
 */
export async function cancelScrapeJob(
  jobId: string
): Promise<ApiResponse<{ success: boolean }>> {
  return apiFetch<{ success: boolean }>(
    `${API_ENDPOINTS.SCRAPER_SERVICE}/api/scrape/${jobId}/cancel`,
    { method: 'POST' }
  )
}

// ============================================
// SITE BUILDER API
// ============================================

export interface BuildSiteRequest {
  projectId: string
  force?: boolean
}

export interface BuildJob {
  id: string
  status: 'queued' | 'building' | 'deploying' | 'completed' | 'failed'
  progress: number
  siteUrl?: string
  error?: string
}

/**
 * Trigger a site rebuild
 */
export async function triggerSiteBuild(
  request: BuildSiteRequest
): Promise<ApiResponse<BuildJob>> {
  return apiFetch<BuildJob>(`${API_ENDPOINTS.SCRAPER_SERVICE}/api/build`, {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

/**
 * Get build job status
 */
export async function getBuildJobStatus(
  jobId: string
): Promise<ApiResponse<BuildJob>> {
  return apiFetch<BuildJob>(
    `${API_ENDPOINTS.SCRAPER_SERVICE}/api/build/${jobId}`
  )
}

// ============================================
// WEBHOOK HANDLERS
// ============================================

export interface WebhookPayload {
  event: 'testimonial.created' | 'testimonial.approved' | 'site.published'
  projectId: string
  data: Record<string, unknown>
}

/**
 * Send webhook notification to user's configured endpoint
 */
export async function sendWebhook(
  webhookUrl: string,
  payload: WebhookPayload
): Promise<ApiResponse<{ success: boolean }>> {
  return apiFetch<{ success: boolean }>(webhookUrl, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// ============================================
// HEALTH CHECK
// ============================================

export async function checkScraperServiceHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_ENDPOINTS.SCRAPER_SERVICE}/health`)
    return response.ok
  } catch {
    return false
  }
}
