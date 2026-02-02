/**
 * useSiteSettings Hook
 * 
 * Manages site configuration for the generated testimonial pages.
 * Each project can have custom branding, layout, and domain settings.
 * 
 * MATCHES DATABASE SCHEMA EXACTLY:
 * - config (JSONB): branding settings
 * - layout_config (JSONB): layout settings
 * - seo_config (JSONB): SEO settings
 * - Separate columns: subdomain, custom_domain, domain_verified, etc.
 * 
 * @module hooks/useSiteSettings
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Json } from '../types/database'

// ============================================================================
// Type Definitions - Matching Database Schema Exactly
// ============================================================================

export type LayoutStyle = 'grid' | 'masonry' | 'carousel' | 'list'
export type CardStyle = 'elevated' | 'bordered' | 'flat' | 'glassmorphism'
export type AnimationStyle = 'fade-up' | 'fade-in' | 'slide-in' | 'none'
export type FontFamily = 'inter' | 'roboto' | 'poppins' | 'playfair' | 'manrope' | 'satoshi'
export type BuildStatus = 'pending' | 'building' | 'success' | 'failed'

/**
 * Branding configuration stored in `config` JSONB column
 */
export interface BrandingConfig {
    company_name: string
    tagline: string
    logo_url: string | null
    favicon_url: string | null
    primary_color: string
    secondary_color: string
    background_color: string
    text_color: string
    font_heading: FontFamily
    font_body: FontFamily
    border_radius: string
}

/**
 * Layout configuration stored in `layout_config` JSONB column
 */
export interface LayoutConfig {
    style: LayoutStyle
    card_style: CardStyle
    cards_per_row: number
    show_avatars: boolean
    show_ratings: boolean
    show_company: boolean
    show_dates: boolean
    show_source_badges: boolean
    show_verification_badges: boolean
    animation_style: AnimationStyle
}

/**
 * SEO configuration stored in `seo_config` JSONB column
 */
export interface SeoConfig {
    meta_title: string | null
    meta_description: string | null
    og_image_url: string | null
    twitter_card: 'summary' | 'summary_large_image'
    noindex: boolean
}

/**
 * Complete site settings matching database row exactly
 */
export interface SiteSettings {
    id: string
    project_id: string
    
    // Domain settings (separate columns)
    subdomain: string | null
    custom_domain: string | null
    domain_verified: boolean
    domain_verification_token: string | null
    page_path: string // URL path e.g., 'wall', 'love', 'testimonials'
    is_published: boolean
    
    // JSONB configs
    config: BrandingConfig
    layout_config: LayoutConfig
    seo_config: SeoConfig
    
    // Advanced settings (separate columns)
    custom_css: string | null
    custom_header_html: string | null
    custom_footer_html: string | null
    show_powered_by: boolean
    
    // Analytics (separate columns)
    ga_tracking_id: string | null
    gtm_container_id: string | null
    
    // Build status
    build_status: BuildStatus
    last_build_at: string | null
    last_build_duration_ms: number | null
    deployed_url: string | null
    
    // Timestamps
    created_at: string
    updated_at: string
}

/**
 * Flattened config for easier UI state management
 * This is what the UI components work with
 */
export interface FlattenedSiteConfig {
    // Branding
    company_name: string
    tagline: string
    logo_url: string | null
    favicon_url: string | null
    primary_color: string
    secondary_color: string
    background_color: string
    text_color: string
    font_heading: FontFamily
    font_body: FontFamily
    border_radius: string
    
    // Layout
    layout_style: LayoutStyle
    card_style: CardStyle
    cards_per_row: number
    show_avatars: boolean
    show_ratings: boolean
    show_company: boolean
    show_dates: boolean
    show_source_badges: boolean
    show_verification_badges: boolean
    animation_style: AnimationStyle
    
    // Domain
    subdomain: string | null
    custom_domain: string | null
    domain_verified: boolean
    page_path: string
    is_published: boolean
    
    // SEO
    meta_title: string | null
    meta_description: string | null
    og_image_url: string | null
    noindex: boolean
    
    // Advanced
    custom_css: string | null
    custom_header_html: string | null
    custom_footer_html: string | null
    show_powered_by: boolean
    
    // Analytics
    ga_tracking_id: string | null
    gtm_container_id: string | null
}

// ============================================================================
// Default Values
// ============================================================================

export const defaultBrandingConfig: BrandingConfig = {
    company_name: '',
    tagline: 'What our customers say',
    logo_url: null,
    favicon_url: null,
    primary_color: '#F59E0B', // amber-500
    secondary_color: '#78716C', // stone-500
    background_color: '#FAFAF9', // stone-50
    text_color: '#1C1917', // stone-900
    font_heading: 'satoshi',
    font_body: 'manrope',
    border_radius: '12px',
}

export const defaultLayoutConfig: LayoutConfig = {
    style: 'grid',
    card_style: 'elevated',
    cards_per_row: 3,
    show_avatars: true,
    show_ratings: true,
    show_company: true,
    show_dates: true,
    show_source_badges: true,
    show_verification_badges: true,
    animation_style: 'fade-up',
}

export const defaultSeoConfig: SeoConfig = {
    meta_title: null,
    meta_description: null,
    og_image_url: null,
    twitter_card: 'summary_large_image',
    noindex: false,
}

export const defaultFlattenedConfig: FlattenedSiteConfig = {
    ...defaultBrandingConfig,
    layout_style: defaultLayoutConfig.style,
    card_style: defaultLayoutConfig.card_style,
    cards_per_row: defaultLayoutConfig.cards_per_row,
    show_avatars: defaultLayoutConfig.show_avatars,
    show_ratings: defaultLayoutConfig.show_ratings,
    show_company: defaultLayoutConfig.show_company,
    show_dates: defaultLayoutConfig.show_dates,
    show_source_badges: defaultLayoutConfig.show_source_badges,
    show_verification_badges: defaultLayoutConfig.show_verification_badges,
    animation_style: defaultLayoutConfig.animation_style,
    subdomain: null,
    custom_domain: null,
    domain_verified: false,
    page_path: 'wall',
    is_published: false,
    meta_title: defaultSeoConfig.meta_title,
    meta_description: defaultSeoConfig.meta_description,
    og_image_url: defaultSeoConfig.og_image_url,
    noindex: defaultSeoConfig.noindex,
    custom_css: null,
    custom_header_html: null,
    custom_footer_html: null,
    show_powered_by: true,
    ga_tracking_id: null,
    gtm_container_id: null,
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Converts database row to flattened config for UI
 */
export function flattenSiteSettings(settings: SiteSettings): FlattenedSiteConfig {
    return {
        // Branding from config JSONB
        company_name: settings.config.company_name,
        tagline: settings.config.tagline,
        logo_url: settings.config.logo_url,
        favicon_url: settings.config.favicon_url,
        primary_color: settings.config.primary_color,
        secondary_color: settings.config.secondary_color,
        background_color: settings.config.background_color,
        text_color: settings.config.text_color,
        font_heading: settings.config.font_heading,
        font_body: settings.config.font_body,
        border_radius: settings.config.border_radius,
        
        // Layout from layout_config JSONB
        layout_style: settings.layout_config.style,
        card_style: settings.layout_config.card_style,
        cards_per_row: settings.layout_config.cards_per_row,
        show_avatars: settings.layout_config.show_avatars,
        show_ratings: settings.layout_config.show_ratings,
        show_company: settings.layout_config.show_company,
        show_dates: settings.layout_config.show_dates,
        show_source_badges: settings.layout_config.show_source_badges,
        show_verification_badges: settings.layout_config.show_verification_badges,
        animation_style: settings.layout_config.animation_style,
        
        // Domain from separate columns
        subdomain: settings.subdomain,
        custom_domain: settings.custom_domain,
        domain_verified: settings.domain_verified,
        page_path: settings.page_path || 'wall',
        is_published: settings.is_published || false,
        
        // SEO from seo_config JSONB
        meta_title: settings.seo_config.meta_title,
        meta_description: settings.seo_config.meta_description,
        og_image_url: settings.seo_config.og_image_url,
        noindex: settings.seo_config.noindex,
        
        // Advanced from separate columns
        custom_css: settings.custom_css,
        custom_header_html: settings.custom_header_html,
        custom_footer_html: settings.custom_footer_html,
        show_powered_by: settings.show_powered_by,
        
        // Analytics from separate columns
        ga_tracking_id: settings.ga_tracking_id,
        gtm_container_id: settings.gtm_container_id,
    }
}

/**
 * Converts flattened UI config back to database update format
 */
export function unflattenConfigToUpdates(flat: Partial<FlattenedSiteConfig>): {
    config?: Partial<BrandingConfig>
    layout_config?: Partial<LayoutConfig>
    seo_config?: Partial<SeoConfig>
    subdomain?: string | null
    custom_domain?: string | null
    page_path?: string
    is_published?: boolean
    custom_css?: string | null
    custom_header_html?: string | null
    custom_footer_html?: string | null
    show_powered_by?: boolean
    ga_tracking_id?: string | null
    gtm_container_id?: string | null
} {
    const updates: ReturnType<typeof unflattenConfigToUpdates> = {}
    
    // Branding fields go to config JSONB
    const brandingFields: (keyof BrandingConfig)[] = [
        'company_name', 'tagline', 'logo_url', 'favicon_url',
        'primary_color', 'secondary_color', 'background_color', 'text_color',
        'font_heading', 'font_body', 'border_radius'
    ]
    
    const brandingUpdates: Partial<BrandingConfig> = {}
    for (const field of brandingFields) {
        if (field in flat) {
            (brandingUpdates as Record<string, unknown>)[field] = flat[field as keyof FlattenedSiteConfig]
        }
    }
    if (Object.keys(brandingUpdates).length > 0) {
        updates.config = brandingUpdates
    }
    
    // Layout fields go to layout_config JSONB
    const layoutUpdates: Partial<LayoutConfig> = {}
    if ('layout_style' in flat) layoutUpdates.style = flat.layout_style
    if ('card_style' in flat) layoutUpdates.card_style = flat.card_style
    if ('cards_per_row' in flat) layoutUpdates.cards_per_row = flat.cards_per_row
    if ('show_avatars' in flat) layoutUpdates.show_avatars = flat.show_avatars
    if ('show_ratings' in flat) layoutUpdates.show_ratings = flat.show_ratings
    if ('show_company' in flat) layoutUpdates.show_company = flat.show_company
    if ('show_dates' in flat) layoutUpdates.show_dates = flat.show_dates
    if ('show_source_badges' in flat) layoutUpdates.show_source_badges = flat.show_source_badges
    if ('show_verification_badges' in flat) layoutUpdates.show_verification_badges = flat.show_verification_badges
    if ('animation_style' in flat) layoutUpdates.animation_style = flat.animation_style
    
    if (Object.keys(layoutUpdates).length > 0) {
        updates.layout_config = layoutUpdates
    }
    
    // SEO fields go to seo_config JSONB
    const seoUpdates: Partial<SeoConfig> = {}
    if ('meta_title' in flat) seoUpdates.meta_title = flat.meta_title
    if ('meta_description' in flat) seoUpdates.meta_description = flat.meta_description
    if ('og_image_url' in flat) seoUpdates.og_image_url = flat.og_image_url
    if ('noindex' in flat) seoUpdates.noindex = flat.noindex
    
    if (Object.keys(seoUpdates).length > 0) {
        updates.seo_config = seoUpdates
    }
    
    // Separate column fields
    if ('subdomain' in flat) updates.subdomain = flat.subdomain
    if ('custom_domain' in flat) updates.custom_domain = flat.custom_domain
    if ('page_path' in flat && flat.page_path) updates.page_path = flat.page_path
    if ('is_published' in flat) updates.is_published = flat.is_published
    if ('custom_css' in flat) updates.custom_css = flat.custom_css
    if ('custom_header_html' in flat) updates.custom_header_html = flat.custom_header_html
    if ('custom_footer_html' in flat) updates.custom_footer_html = flat.custom_footer_html
    if ('show_powered_by' in flat) updates.show_powered_by = flat.show_powered_by
    if ('ga_tracking_id' in flat) updates.ga_tracking_id = flat.ga_tracking_id
    if ('gtm_container_id' in flat) updates.gtm_container_id = flat.gtm_container_id
    
    return updates
}

// ============================================================================
// Safe Type Casting Helpers
// ============================================================================

/**
 * Safely casts JSON data to BrandingConfig
 */
function asBrandingConfig(data: unknown): BrandingConfig {
    const obj = (data ?? {}) as Record<string, unknown>
    return {
        company_name: String(obj.company_name ?? defaultBrandingConfig.company_name),
        tagline: String(obj.tagline ?? defaultBrandingConfig.tagline),
        logo_url: obj.logo_url as string | null ?? defaultBrandingConfig.logo_url,
        favicon_url: obj.favicon_url as string | null ?? defaultBrandingConfig.favicon_url,
        primary_color: String(obj.primary_color ?? defaultBrandingConfig.primary_color),
        secondary_color: String(obj.secondary_color ?? defaultBrandingConfig.secondary_color),
        background_color: String(obj.background_color ?? defaultBrandingConfig.background_color),
        text_color: String(obj.text_color ?? defaultBrandingConfig.text_color),
        font_heading: (obj.font_heading as FontFamily) ?? defaultBrandingConfig.font_heading,
        font_body: (obj.font_body as FontFamily) ?? defaultBrandingConfig.font_body,
        border_radius: String(obj.border_radius ?? defaultBrandingConfig.border_radius),
    }
}

/**
 * Safely casts JSON data to LayoutConfig
 */
function asLayoutConfig(data: unknown): LayoutConfig {
    const obj = (data ?? {}) as Record<string, unknown>
    return {
        style: (obj.style as LayoutStyle) ?? defaultLayoutConfig.style,
        card_style: (obj.card_style as CardStyle) ?? defaultLayoutConfig.card_style,
        cards_per_row: Number(obj.cards_per_row ?? defaultLayoutConfig.cards_per_row),
        show_avatars: Boolean(obj.show_avatars ?? defaultLayoutConfig.show_avatars),
        show_ratings: Boolean(obj.show_ratings ?? defaultLayoutConfig.show_ratings),
        show_company: Boolean(obj.show_company ?? defaultLayoutConfig.show_company),
        show_dates: Boolean(obj.show_dates ?? defaultLayoutConfig.show_dates),
        show_source_badges: Boolean(obj.show_source_badges ?? defaultLayoutConfig.show_source_badges),
        show_verification_badges: Boolean(obj.show_verification_badges ?? defaultLayoutConfig.show_verification_badges),
        animation_style: (obj.animation_style as AnimationStyle) ?? defaultLayoutConfig.animation_style,
    }
}

/**
 * Safely casts JSON data to SeoConfig
 */
function asSeoConfig(data: unknown): SeoConfig {
    const obj = (data ?? {}) as Record<string, unknown>
    return {
        meta_title: obj.meta_title as string | null ?? defaultSeoConfig.meta_title,
        meta_description: obj.meta_description as string | null ?? defaultSeoConfig.meta_description,
        og_image_url: obj.og_image_url as string | null ?? defaultSeoConfig.og_image_url,
        twitter_card: (obj.twitter_card as 'summary' | 'summary_large_image') ?? defaultSeoConfig.twitter_card,
        noindex: Boolean(obj.noindex ?? defaultSeoConfig.noindex),
    }
}

// ============================================================================
// Query Keys Factory
// ============================================================================

export const siteSettingsQueryKeys = {
    all: ['site-settings'] as const,
    byProject: (projectId: string) => [...siteSettingsQueryKeys.all, projectId] as const,
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetches site settings for a project
 */
async function fetchSiteSettings(projectId: string): Promise<SiteSettings | null> {
    const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle()

    if (error) {
        console.error('[useSiteSettings] Failed to fetch site settings: - useSiteSettings.ts:444', error)
        throw new Error(`Failed to fetch site settings: ${error.message}`)
    }

    if (!data) return null
    
    // Ensure all required fields have defaults
    const settings: SiteSettings = {
        id: data.id,
        project_id: data.project_id,
        subdomain: data.subdomain ?? null,
        custom_domain: data.custom_domain ?? null,
        domain_verified: data.domain_verified ?? false,
        domain_verification_token: data.domain_verification_token ?? null,
        page_path: data.page_path ?? 'wall',
        is_published: data.is_published ?? false,
        config: asBrandingConfig(data.config),
        layout_config: asLayoutConfig(data.layout_config),
        seo_config: asSeoConfig(data.seo_config),
        custom_css: data.custom_css ?? null,
        custom_header_html: data.custom_header_html ?? null,
        custom_footer_html: data.custom_footer_html ?? null,
        show_powered_by: data.show_powered_by ?? true,
        ga_tracking_id: data.ga_tracking_id ?? null,
        gtm_container_id: data.gtm_container_id ?? null,
        build_status: (data.build_status as BuildStatus) ?? 'pending',
        last_build_at: data.last_build_at ?? null,
        last_build_duration_ms: data.last_build_duration_ms ?? null,
        deployed_url: data.deployed_url ?? null,
        created_at: data.created_at,
        updated_at: data.updated_at,
    }

    return settings
}

/**
 * Creates default site settings for a project
 */
async function createSiteSettings(
    projectId: string, 
    companyName: string,
    subdomain?: string
): Promise<SiteSettings> {
    const config: BrandingConfig = {
        ...defaultBrandingConfig,
        company_name: companyName,
    }
    
    // Generate subdomain from company name if not provided
    const generatedSubdomain = subdomain || companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

    const { data, error } = await supabase
        .from('site_settings')
        .insert({
            project_id: projectId,
            subdomain: generatedSubdomain,
            page_path: 'wall',
            is_published: false,
            config: config as unknown as Json,
            layout_config: defaultLayoutConfig as unknown as Json,
            seo_config: defaultSeoConfig as unknown as Json,
            build_status: 'pending',
        })
        .select()
        .single()

    if (error) {
        console.error('[useSiteSettings] Failed to create site settings: - useSiteSettings.ts:511', error)
        throw new Error(`Failed to create site settings: ${error.message}`)
    }

    return {
        id: data.id,
        project_id: data.project_id,
        subdomain: data.subdomain ?? generatedSubdomain,
        custom_domain: data.custom_domain ?? null,
        domain_verified: data.domain_verified ?? false,
        domain_verification_token: data.domain_verification_token ?? null,
        page_path: data.page_path ?? 'wall',
        is_published: data.is_published ?? false,
        config: asBrandingConfig(data.config),
        layout_config: asLayoutConfig(data.layout_config),
        seo_config: asSeoConfig(data.seo_config),
        custom_css: data.custom_css ?? null,
        custom_header_html: data.custom_header_html ?? null,
        custom_footer_html: data.custom_footer_html ?? null,
        show_powered_by: data.show_powered_by ?? true,
        ga_tracking_id: data.ga_tracking_id ?? null,
        gtm_container_id: data.gtm_container_id ?? null,
        build_status: (data.build_status as BuildStatus) ?? 'pending',
        last_build_at: data.last_build_at ?? null,
        last_build_duration_ms: data.last_build_duration_ms ?? null,
        deployed_url: data.deployed_url ?? null,
        created_at: data.created_at,
        updated_at: data.updated_at,
    }
}

/**
 * Updates site settings - handles JSONB merging correctly
 */
async function updateSiteSettings(
    settingsId: string,
    updates: Partial<FlattenedSiteConfig>
): Promise<SiteSettings> {
    // First fetch current settings to merge JSONB fields properly
    const { data: current, error: fetchError } = await supabase
        .from('site_settings')
        .select('config, layout_config, seo_config')
        .eq('id', settingsId)
        .single()

    if (fetchError) {
        throw new Error(`Failed to fetch current settings: ${fetchError.message}`)
    }

    // Unflatten the updates to get proper database structure
    const dbUpdates = unflattenConfigToUpdates(updates)
    
    // Build the update payload, merging JSONB fields with existing data
    const updatePayload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
    }
    
    // Merge config JSONB if there are branding updates
    if (dbUpdates.config) {
        updatePayload.config = {
            ...asBrandingConfig(current.config),
            ...dbUpdates.config,
        }
    }
    
    // Merge layout_config JSONB if there are layout updates
    if (dbUpdates.layout_config) {
        updatePayload.layout_config = {
            ...asLayoutConfig(current.layout_config),
            ...dbUpdates.layout_config,
        }
    }
    
    // Merge seo_config JSONB if there are SEO updates
    if (dbUpdates.seo_config) {
        updatePayload.seo_config = {
            ...asSeoConfig(current.seo_config),
            ...dbUpdates.seo_config,
        }
    }
    
    // Add separate column updates directly
    if ('subdomain' in dbUpdates) updatePayload.subdomain = dbUpdates.subdomain
    if ('custom_domain' in dbUpdates) updatePayload.custom_domain = dbUpdates.custom_domain
    if ('page_path' in dbUpdates) updatePayload.page_path = dbUpdates.page_path
    if ('is_published' in dbUpdates) updatePayload.is_published = dbUpdates.is_published
    if ('custom_css' in dbUpdates) updatePayload.custom_css = dbUpdates.custom_css
    if ('custom_header_html' in dbUpdates) updatePayload.custom_header_html = dbUpdates.custom_header_html
    if ('custom_footer_html' in dbUpdates) updatePayload.custom_footer_html = dbUpdates.custom_footer_html
    if ('show_powered_by' in dbUpdates) updatePayload.show_powered_by = dbUpdates.show_powered_by
    if ('ga_tracking_id' in dbUpdates) updatePayload.ga_tracking_id = dbUpdates.ga_tracking_id
    if ('gtm_container_id' in dbUpdates) updatePayload.gtm_container_id = dbUpdates.gtm_container_id

    const { data, error } = await supabase
        .from('site_settings')
        .update(updatePayload)
        .eq('id', settingsId)
        .select()
        .single()

    if (error) {
        console.error('[useSiteSettings] Failed to update site settings: - useSiteSettings.ts:608', error)
        throw new Error(`Failed to update site settings: ${error.message}`)
    }

    return {
        id: data.id,
        project_id: data.project_id,
        subdomain: data.subdomain ?? null,
        custom_domain: data.custom_domain ?? null,
        domain_verified: data.domain_verified ?? false,
        domain_verification_token: data.domain_verification_token ?? null,
        page_path: data.page_path ?? 'wall',
        is_published: data.is_published ?? false,
        config: asBrandingConfig(data.config),
        layout_config: asLayoutConfig(data.layout_config),
        seo_config: asSeoConfig(data.seo_config),
        custom_css: data.custom_css ?? null,
        custom_header_html: data.custom_header_html ?? null,
        custom_footer_html: data.custom_footer_html ?? null,
        show_powered_by: data.show_powered_by ?? true,
        ga_tracking_id: data.ga_tracking_id ?? null,
        gtm_container_id: data.gtm_container_id ?? null,
        build_status: (data.build_status as BuildStatus) ?? 'pending',
        last_build_at: data.last_build_at ?? null,
        last_build_duration_ms: data.last_build_duration_ms ?? null,
        deployed_url: data.deployed_url ?? null,
        created_at: data.created_at,
        updated_at: data.updated_at,
    }
}

/**
 * Triggers a site rebuild by calling the Edge Function
 */
async function triggerSiteBuild(projectId: string, settingsId: string): Promise<SiteSettings> {
    // First update build status to "building"
    const { error: statusError } = await supabase
        .from('site_settings')
        .update({
            build_status: 'building',
            updated_at: new Date().toISOString(),
        })
        .eq('id', settingsId)

    if (statusError) {
        throw new Error(`Failed to update build status: ${statusError.message}`)
    }

    // Call the Edge Function to trigger the actual build
    const { data: buildResult, error: buildError } = await supabase.functions.invoke('build-site', {
        body: { project_id: projectId },
    })

    if (buildError) {
        // Update status to failed
        await supabase
            .from('site_settings')
            .update({
                build_status: 'failed',
                updated_at: new Date().toISOString(),
            })
            .eq('id', settingsId)
        
        console.error('[useSiteSettings] Build failed: - useSiteSettings.ts:669', buildError)
        throw new Error(`Build failed: ${buildError.message}`)
    }

    // Fetch updated settings
    const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', settingsId)
        .single()

    if (error) {
        throw new Error(`Failed to fetch updated settings: ${error.message}`)
    }

    console.log('[useSiteSettings] Build triggered successfully: - useSiteSettings.ts:684', buildResult)

    return {
        id: data.id,
        project_id: data.project_id,
        subdomain: data.subdomain ?? null,
        custom_domain: data.custom_domain ?? null,
        domain_verified: data.domain_verified ?? false,
        domain_verification_token: data.domain_verification_token ?? null,
        page_path: data.page_path ?? 'wall',
        is_published: data.is_published ?? false,
        config: asBrandingConfig(data.config),
        layout_config: asLayoutConfig(data.layout_config),
        seo_config: asSeoConfig(data.seo_config),
        custom_css: data.custom_css ?? null,
        custom_header_html: data.custom_header_html ?? null,
        custom_footer_html: data.custom_footer_html ?? null,
        show_powered_by: data.show_powered_by ?? true,
        ga_tracking_id: data.ga_tracking_id ?? null,
        gtm_container_id: data.gtm_container_id ?? null,
        build_status: (data.build_status as BuildStatus) ?? 'pending',
        last_build_at: data.last_build_at ?? null,
        last_build_duration_ms: data.last_build_duration_ms ?? null,
        deployed_url: data.deployed_url ?? null,
        created_at: data.created_at,
        updated_at: data.updated_at,
    }
}

/**
 * Verifies custom domain ownership by calling the Edge Function
 */
async function verifyCustomDomain(
    settingsId: string, 
    domain: string
): Promise<{ verified: boolean; error?: string }> {
    // Call the Edge Function to verify DNS
    const { data, error } = await supabase.functions.invoke('verify-domain', {
        body: { settings_id: settingsId, domain },
    })

    if (error) {
        console.error('[useSiteSettings] Domain verification failed: - useSiteSettings.ts:724', error)
        return { verified: false, error: error.message }
    }

    return { 
        verified: data?.verified ?? false, 
        error: data?.error 
    }
}

/**
 * Updates custom domain and optionally verifies it
 */
async function setCustomDomain(
    settingsId: string,
    domain: string | null
): Promise<SiteSettings> {
    const { data, error } = await supabase
        .from('site_settings')
        .update({
            custom_domain: domain,
            domain_verified: false, // Reset verification when domain changes
            updated_at: new Date().toISOString(),
        })
        .eq('id', settingsId)
        .select()
        .single()

    if (error) {
        throw new Error(`Failed to update custom domain: ${error.message}`)
    }

    return {
        id: data.id,
        project_id: data.project_id,
        subdomain: data.subdomain ?? null,
        custom_domain: data.custom_domain ?? null,
        domain_verified: data.domain_verified ?? false,
        domain_verification_token: data.domain_verification_token ?? null,
        page_path: data.page_path ?? 'wall',
        is_published: data.is_published ?? false,
        config: asBrandingConfig(data.config),
        layout_config: asLayoutConfig(data.layout_config),
        seo_config: asSeoConfig(data.seo_config),
        custom_css: data.custom_css ?? null,
        custom_header_html: data.custom_header_html ?? null,
        custom_footer_html: data.custom_footer_html ?? null,
        show_powered_by: data.show_powered_by ?? true,
        ga_tracking_id: data.ga_tracking_id ?? null,
        gtm_container_id: data.gtm_container_id ?? null,
        build_status: (data.build_status as BuildStatus) ?? 'pending',
        last_build_at: data.last_build_at ?? null,
        last_build_duration_ms: data.last_build_duration_ms ?? null,
        deployed_url: data.deployed_url ?? null,
        created_at: data.created_at,
        updated_at: data.updated_at,
    }
}

/**
 * Upload logo to Supabase Storage and update settings
 */
async function uploadLogo(
    settingsId: string,
    projectId: string,
    file: File
): Promise<{ url: string }> {
    // Validate file
    const MAX_SIZE = 2 * 1024 * 1024 // 2MB
    const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']
    
    if (file.size > MAX_SIZE) {
        throw new Error('Logo file must be less than 2MB')
    }
    
    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error('Logo must be PNG, JPEG, SVG, or WebP')
    }

    // Generate unique filename
    const extension = file.name.split('.').pop() || 'png'
    const fileName = `${projectId}/logo-${Date.now()}.${extension}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true,
        })

    if (uploadError) {
        console.error('[useSiteSettings] Logo upload failed: - useSiteSettings.ts:814', uploadError)
        throw new Error(`Failed to upload logo: ${uploadError.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from('site-assets')
        .getPublicUrl(fileName)

    const logoUrl = urlData.publicUrl

    // Update site settings with new logo URL
    const { data: current, error: fetchError } = await supabase
        .from('site_settings')
        .select('config')
        .eq('id', settingsId)
        .single()

    if (fetchError) {
        throw new Error(`Failed to fetch current settings: ${fetchError.message}`)
    }

    const updatedConfig = {
        ...asBrandingConfig(current.config),
        logo_url: logoUrl,
    }

    const { error: updateError } = await supabase
        .from('site_settings')
        .update({
            config: updatedConfig,
            updated_at: new Date().toISOString(),
        })
        .eq('id', settingsId)

    if (updateError) {
        throw new Error(`Failed to update logo URL: ${updateError.message}`)
    }

    return { url: logoUrl }
}

/**
 * Upload favicon to Supabase Storage and update settings
 */
async function uploadFavicon(
    settingsId: string,
    projectId: string,
    file: File
): Promise<{ url: string }> {
    // Validate file
    const MAX_SIZE = 512 * 1024 // 512KB
    const ALLOWED_TYPES = ['image/png', 'image/x-icon', 'image/svg+xml']
    
    if (file.size > MAX_SIZE) {
        throw new Error('Favicon file must be less than 512KB')
    }
    
    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error('Favicon must be PNG, ICO, or SVG')
    }

    // Generate unique filename
    const extension = file.name.split('.').pop() || 'png'
    const fileName = `${projectId}/favicon-${Date.now()}.${extension}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true,
        })

    if (uploadError) {
        console.error('[useSiteSettings] Favicon upload failed: - useSiteSettings.ts:889', uploadError)
        throw new Error(`Failed to upload favicon: ${uploadError.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from('site-assets')
        .getPublicUrl(fileName)

    const faviconUrl = urlData.publicUrl

    // Update site settings with new favicon URL
    const { data: current, error: fetchError } = await supabase
        .from('site_settings')
        .select('config')
        .eq('id', settingsId)
        .single()

    if (fetchError) {
        throw new Error(`Failed to fetch current settings: ${fetchError.message}`)
    }

    const updatedConfig = {
        ...asBrandingConfig(current.config),
        favicon_url: faviconUrl,
    }

    const { error: updateError } = await supabase
        .from('site_settings')
        .update({
            config: updatedConfig,
            updated_at: new Date().toISOString(),
        })
        .eq('id', settingsId)

    if (updateError) {
        throw new Error(`Failed to update favicon URL: ${updateError.message}`)
    }

    return { url: faviconUrl }
}

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook to fetch site settings for a project
 */
export function useSiteSettings(projectId: string) {
    return useQuery({
        queryKey: siteSettingsQueryKeys.byProject(projectId),
        queryFn: () => fetchSiteSettings(projectId),
        enabled: !!projectId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

/**
 * Hook to create site settings
 */
export function useCreateSiteSettings() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ projectId, companyName, subdomain }: { 
            projectId: string
            companyName: string
            subdomain?: string 
        }) => createSiteSettings(projectId, companyName, subdomain),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: siteSettingsQueryKeys.byProject(projectId) })
        },
    })
}

/**
 * Hook to update site settings
 */
export function useUpdateSiteSettings() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ settingsId, updates }: { 
            settingsId: string
            updates: Partial<FlattenedSiteConfig> 
        }) => updateSiteSettings(settingsId, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: siteSettingsQueryKeys.all })
        },
    })
}

/**
 * Hook to trigger a site rebuild
 */
export function useTriggerBuild() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ projectId, settingsId }: { projectId: string; settingsId: string }) => 
            triggerSiteBuild(projectId, settingsId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: siteSettingsQueryKeys.all })
        },
    })
}

/**
 * Hook to set custom domain
 */
export function useSetCustomDomain() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ settingsId, domain }: { settingsId: string; domain: string | null }) =>
            setCustomDomain(settingsId, domain),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: siteSettingsQueryKeys.all })
        },
    })
}

/**
 * Hook to verify custom domain
 */
export function useVerifyDomain() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ settingsId, domain }: { settingsId: string; domain: string }) =>
            verifyCustomDomain(settingsId, domain),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: siteSettingsQueryKeys.all })
        },
    })
}

/**
 * Hook to upload logo
 */
export function useUploadLogo() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ settingsId, projectId, file }: { 
            settingsId: string
            projectId: string
            file: File 
        }) => uploadLogo(settingsId, projectId, file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: siteSettingsQueryKeys.all })
        },
    })
}

/**
 * Hook to upload favicon
 */
export function useUploadFavicon() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ settingsId, projectId, file }: { 
            settingsId: string
            projectId: string
            file: File 
        }) => uploadFavicon(settingsId, projectId, file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: siteSettingsQueryKeys.all })
        },
    })
}

// ============================================================================
// Legacy Exports for Backwards Compatibility
// ============================================================================

// These maintain backwards compatibility with existing code
export type SiteConfig = FlattenedSiteConfig
export const defaultSiteConfig = defaultFlattenedConfig
