/**
 * useAnalytics Hook
 * 
 * Production-grade React Query hook for fetching and aggregating analytics data.
 * Provides real-time metrics, time series data, and performance insights.
 * 
 * @module hooks/useAnalytics
 * @version 1.0.0
 */

import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/database'

// ============================================================================
// Type Definitions
// ============================================================================

export type DateRange = '7d' | '30d' | '90d' | 'custom'
export type EventType = Database['public']['Enums']['event_type']

export interface AnalyticsMetrics {
    totalViews: number
    totalClicks: number
    conversionRate: number
    activeWidgets: number
    viewsTrend: number
    clicksTrend: number
    conversionTrend: number
}

export interface TimeSeriesData {
    date: string
    views: number
    clicks: number
    conversions: number
}

export interface TestimonialPerformance {
    id: string
    authorName: string
    authorAvatar: string | null
    content: string
    views: number
    clicks: number
    conversionRate: number
}

export interface SourceBreakdown {
    source: string
    count: number
    percentage: number
}

export interface PageEngagement {
    url: string
    views: number
    clicks: number
    engagement: number
}

interface AnalyticsEvent {
    id: string
    event_type: EventType
    timestamp: string
    widget_id: string | null
    testimonial_id: string | null
    visitor_context: {
        url?: string
        referrer?: string
        device?: string
    } | null
}

// ============================================================================
// Query Keys Factory
// ============================================================================

export const analyticsQueryKeys = {
    all: ['analytics'] as const,
    metrics: (projectId: string, range: DateRange) => [...analyticsQueryKeys.all, 'metrics', projectId, range] as const,
    timeSeries: (projectId: string, range: DateRange) => [...analyticsQueryKeys.all, 'timeseries', projectId, range] as const,
    testimonials: (projectId: string, range: DateRange) => [...analyticsQueryKeys.all, 'testimonials', projectId, range] as const,
    sources: (projectId: string, range: DateRange) => [...analyticsQueryKeys.all, 'sources', projectId, range] as const,
    pages: (projectId: string, range: DateRange) => [...analyticsQueryKeys.all, 'pages', projectId, range] as const,
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculates the start date based on the date range
 */
function getDateRangeStart(range: DateRange): Date {
    const now = new Date()
    switch (range) {
        case '7d':
            return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        case '30d':
            return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        case '90d':
            return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        default:
            return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }
}

/**
 * Gets the previous period for trend calculation
 */
function getPreviousPeriodDates(range: DateRange): { start: Date; end: Date } {
    const currentStart = getDateRangeStart(range)
    const now = new Date()
    const periodLength = now.getTime() - currentStart.getTime()
    
    return {
        start: new Date(currentStart.getTime() - periodLength),
        end: currentStart,
    }
}

/**
 * Calculates percentage change between two values
 */
function calculateTrend(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0
    return parseFloat((((current - previous) / previous) * 100).toFixed(1))
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetches widget IDs for a project
 */
async function getProjectWidgetIds(projectId: string): Promise<string[]> {
    const { data } = await supabase
        .from('widgets')
        .select('id')
        .eq('project_id', projectId)
    
    return data?.map(w => w.id) || []
}

/**
 * Fetches analytics metrics with trend comparison
 */
async function fetchAnalyticsMetrics(projectId: string, range: DateRange): Promise<AnalyticsMetrics> {
    const widgetIds = await getProjectWidgetIds(projectId)
    
    if (widgetIds.length === 0) {
        return {
            totalViews: 0,
            totalClicks: 0,
            conversionRate: 0,
            activeWidgets: 0,
            viewsTrend: 0,
            clicksTrend: 0,
            conversionTrend: 0,
        }
    }

    const startDate = getDateRangeStart(range)
    const { start: prevStart, end: prevEnd } = getPreviousPeriodDates(range)

    // Fetch current period events
    const { data: currentEvents, error: currentError } = await supabase
        .from('analytics_events')
        .select('event_type')
        .in('widget_id', widgetIds)
        .gte('timestamp', startDate.toISOString())

    if (currentError) {
        console.error('[useAnalytics] Failed to fetch current metrics:', currentError)
        throw new Error(`Failed to fetch analytics: ${currentError.message}`)
    }

    // Fetch previous period events for trend
    const { data: previousEvents } = await supabase
        .from('analytics_events')
        .select('event_type')
        .in('widget_id', widgetIds)
        .gte('timestamp', prevStart.toISOString())
        .lt('timestamp', prevEnd.toISOString())

    // Count current period
    const currentViews = currentEvents?.filter(e => e.event_type === 'view').length || 0
    const currentClicks = currentEvents?.filter(e => e.event_type === 'click').length || 0
    const currentConversions = currentEvents?.filter(e => e.event_type === 'conversion').length || 0

    // Count previous period
    const prevViews = previousEvents?.filter(e => e.event_type === 'view').length || 0
    const prevClicks = previousEvents?.filter(e => e.event_type === 'click').length || 0
    const prevConversions = previousEvents?.filter(e => e.event_type === 'conversion').length || 0

    // Calculate conversion rates
    const currentConversionRate = currentViews > 0 ? (currentConversions / currentViews) * 100 : 0
    const prevConversionRate = prevViews > 0 ? (prevConversions / prevViews) * 100 : 0

    // Get active widget count
    const { count: activeWidgetCount } = await supabase
        .from('widgets')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId)
        .eq('is_active', true)

    return {
        totalViews: currentViews,
        totalClicks: currentClicks,
        conversionRate: parseFloat(currentConversionRate.toFixed(2)),
        activeWidgets: activeWidgetCount || 0,
        viewsTrend: calculateTrend(currentViews, prevViews),
        clicksTrend: calculateTrend(currentClicks, prevClicks),
        conversionTrend: calculateTrend(currentConversionRate, prevConversionRate),
    }
}

/**
 * Fetches time series data aggregated by day
 */
async function fetchTimeSeries(projectId: string, range: DateRange): Promise<TimeSeriesData[]> {
    const widgetIds = await getProjectWidgetIds(projectId)
    const startDate = getDateRangeStart(range)
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90

    if (widgetIds.length === 0) {
        // Return empty time series with dates
        return generateEmptyTimeSeries(days)
    }

    const { data: events, error } = await supabase
        .from('analytics_events')
        .select('event_type, timestamp')
        .in('widget_id', widgetIds)
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: true })

    if (error) {
        console.error('[useAnalytics] Failed to fetch time series:', error)
        throw new Error(`Failed to fetch time series: ${error.message}`)
    }

    // Aggregate by day
    const dailyData: Record<string, { views: number; clicks: number; conversions: number }> = {}

    // Initialize all days with zeros
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        const dateKey = date.toISOString().split('T')[0]
        dailyData[dateKey] = { views: 0, clicks: 0, conversions: 0 }
    }

    // Aggregate events
    events?.forEach(event => {
        const dateKey = event.timestamp.split('T')[0]
        if (dailyData[dateKey]) {
            switch (event.event_type) {
                case 'view':
                    dailyData[dateKey].views++
                    break
                case 'click':
                    dailyData[dateKey].clicks++
                    break
                case 'conversion':
                    dailyData[dateKey].conversions++
                    break
            }
        }
    })

    // Convert to array
    return Object.entries(dailyData)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Generates empty time series for display when no data exists
 */
function generateEmptyTimeSeries(days: number): TimeSeriesData[] {
    const data: TimeSeriesData[] = []
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        data.push({
            date: date.toISOString().split('T')[0],
            views: 0,
            clicks: 0,
            conversions: 0,
        })
    }
    return data
}

/**
 * Fetches top performing testimonials
 */
async function fetchTestimonialPerformance(projectId: string, range: DateRange): Promise<TestimonialPerformance[]> {
    const startDate = getDateRangeStart(range)

    // Get testimonials with their analytics
    const { data: testimonials, error: testimonialError } = await supabase
        .from('testimonials')
        .select('id, author_name, author_avatar, content_text')
        .eq('project_id', projectId)
        .eq('status', 'approved')
        .limit(10)

    if (testimonialError) {
        console.error('[useAnalytics] Failed to fetch testimonials:', testimonialError)
        throw new Error(`Failed to fetch testimonials: ${testimonialError.message}`)
    }

    if (!testimonials || testimonials.length === 0) {
        return []
    }

    const testimonialIds = testimonials.map(t => t.id)

    // Get analytics for these testimonials
    const { data: events } = await supabase
        .from('analytics_events')
        .select('testimonial_id, event_type')
        .in('testimonial_id', testimonialIds)
        .gte('timestamp', startDate.toISOString())

    // Aggregate by testimonial
    const statsMap: Record<string, { views: number; clicks: number; conversions: number }> = {}
    testimonialIds.forEach(id => {
        statsMap[id] = { views: 0, clicks: 0, conversions: 0 }
    })

    events?.forEach(event => {
        if (event.testimonial_id && statsMap[event.testimonial_id]) {
            switch (event.event_type) {
                case 'view':
                    statsMap[event.testimonial_id].views++
                    break
                case 'click':
                    statsMap[event.testimonial_id].clicks++
                    break
                case 'conversion':
                    statsMap[event.testimonial_id].conversions++
                    break
            }
        }
    })

    // Map and sort by views
    return testimonials
        .map(t => {
            const stats = statsMap[t.id]
            const conversionRate = stats.views > 0 
                ? parseFloat(((stats.conversions / stats.views) * 100).toFixed(1))
                : 0

            return {
                id: t.id,
                authorName: t.author_name || 'Anonymous',
                authorAvatar: t.author_avatar,
                content: t.content_text || '',
                views: stats.views,
                clicks: stats.clicks,
                conversionRate,
            }
        })
        .sort((a, b) => b.views - a.views)
}

/**
 * Fetches testimonial source breakdown
 */
async function fetchSourceBreakdown(projectId: string): Promise<SourceBreakdown[]> {
    const { data, error } = await supabase
        .from('testimonials')
        .select('source')
        .eq('project_id', projectId)

    if (error) {
        console.error('[useAnalytics] Failed to fetch source breakdown:', error)
        throw new Error(`Failed to fetch sources: ${error.message}`)
    }

    // Count by source
    const sourceCounts: Record<string, number> = {}
    data?.forEach(t => {
        const source = t.source || 'direct'
        sourceCounts[source] = (sourceCounts[source] || 0) + 1
    })

    const total = Object.values(sourceCounts).reduce((sum, count) => sum + count, 0)

    // Convert to array and calculate percentages
    return Object.entries(sourceCounts)
        .map(([source, count]) => ({
            source: source.charAt(0).toUpperCase() + source.slice(1),
            count,
            percentage: total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0,
        }))
        .sort((a, b) => b.count - a.count)
}

/**
 * Fetches page engagement data from visitor context
 */
async function fetchPageEngagement(projectId: string, range: DateRange): Promise<PageEngagement[]> {
    const widgetIds = await getProjectWidgetIds(projectId)
    const startDate = getDateRangeStart(range)

    if (widgetIds.length === 0) {
        return []
    }

    const { data: events, error } = await supabase
        .from('analytics_events')
        .select('event_type, visitor_context')
        .in('widget_id', widgetIds)
        .gte('timestamp', startDate.toISOString())

    if (error) {
        console.error('[useAnalytics] Failed to fetch page engagement:', error)
        throw new Error(`Failed to fetch page engagement: ${error.message}`)
    }

    // Aggregate by URL from visitor_context
    const pageStats: Record<string, { views: number; clicks: number }> = {}

    events?.forEach(event => {
        const context = event.visitor_context as AnalyticsEvent['visitor_context']
        const url = context?.url || '/'
        
        if (!pageStats[url]) {
            pageStats[url] = { views: 0, clicks: 0 }
        }

        switch (event.event_type) {
            case 'view':
                pageStats[url].views++
                break
            case 'click':
                pageStats[url].clicks++
                break
        }
    })

    // Convert to array and calculate engagement
    return Object.entries(pageStats)
        .map(([url, stats]) => ({
            url,
            views: stats.views,
            clicks: stats.clicks,
            engagement: stats.views > 0 
                ? parseFloat(((stats.clicks / stats.views) * 100).toFixed(1))
                : 0,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10) // Top 10 pages
}

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook to fetch analytics overview metrics
 */
export function useAnalyticsMetrics(projectId: string, range: DateRange) {
    return useQuery({
        queryKey: analyticsQueryKeys.metrics(projectId, range),
        queryFn: () => fetchAnalyticsMetrics(projectId, range),
        enabled: !!projectId,
        refetchInterval: 60000, // Refresh every minute
        placeholderData: (previousData) => previousData ?? {
            totalViews: 0,
            totalClicks: 0,
            conversionRate: 0,
            activeWidgets: 0,
            viewsTrend: 0,
            clicksTrend: 0,
            conversionTrend: 0,
        },
    })
}

/**
 * Hook to fetch time series analytics data
 */
export function useAnalyticsTimeSeries(projectId: string, range: DateRange) {
    return useQuery({
        queryKey: analyticsQueryKeys.timeSeries(projectId, range),
        queryFn: () => fetchTimeSeries(projectId, range),
        enabled: !!projectId,
        refetchInterval: 60000,
        placeholderData: (previousData) => previousData,
    })
}

/**
 * Hook to fetch top performing testimonials
 */
export function useTestimonialPerformance(projectId: string, range: DateRange) {
    return useQuery({
        queryKey: analyticsQueryKeys.testimonials(projectId, range),
        queryFn: () => fetchTestimonialPerformance(projectId, range),
        enabled: !!projectId,
        refetchInterval: 60000,
        placeholderData: (previousData) => previousData,
    })
}

/**
 * Hook to fetch source breakdown
 */
export function useSourceBreakdown(projectId: string, range: DateRange) {
    return useQuery({
        queryKey: analyticsQueryKeys.sources(projectId, range),
        queryFn: () => fetchSourceBreakdown(projectId),
        enabled: !!projectId,
        refetchInterval: 60000,
        placeholderData: (previousData) => previousData,
    })
}

/**
 * Hook to fetch page engagement data
 */
export function usePageEngagement(projectId: string, range: DateRange) {
    return useQuery({
        queryKey: analyticsQueryKeys.pages(projectId, range),
        queryFn: () => fetchPageEngagement(projectId, range),
        enabled: !!projectId,
        refetchInterval: 60000,
        placeholderData: (previousData) => previousData,
    })
}
