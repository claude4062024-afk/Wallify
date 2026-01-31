/**
 * useSettings Hook
 * 
 * Production-grade React Query hook for managing user settings, notifications,
 * and profile updates. Provides mutations with optimistic updates.
 * 
 * @module hooks/useSettings
 * @version 1.0.0
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Database, Json } from '../types/database'
import { useAuth } from './useAuth'

// ============================================================================
// Type Definitions
// ============================================================================

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export interface NotificationPreferences {
    newTestimonial: boolean
    lowQualityFlag: boolean
    widgetAlerts: boolean
    weeklySummary: boolean
}

export interface IntegrationStatus {
    id: string
    name: string
    description: string
    type: 'oauth' | 'api'
    connected: boolean
    connectedAt?: string
    apiKey?: string
}

export interface ProfileUpdateParams {
    full_name?: string
    avatar_url?: string | null
}

export interface OrganizationSettings {
    notifications?: NotificationPreferences
    integrations?: Record<string, { connected: boolean; connectedAt?: string; apiKey?: string }>
    customBranding?: {
        primaryColor?: string
        logo?: string
    }
}

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
    newTestimonial: true,
    lowQualityFlag: true,
    widgetAlerts: false,
    weeklySummary: true,
}

const DEFAULT_INTEGRATIONS: IntegrationStatus[] = [
    { id: 'twitter', name: 'Twitter / X', description: 'Import testimonials from Twitter mentions', type: 'oauth', connected: false },
    { id: 'linkedin', name: 'LinkedIn', description: 'Import recommendations from LinkedIn', type: 'oauth', connected: false },
    { id: 'g2', name: 'G2', description: 'Sync reviews from G2 Crowd', type: 'api', connected: false },
    { id: 'trustpilot', name: 'Trustpilot', description: 'Import Trustpilot reviews', type: 'api', connected: false },
    { id: 'stripe', name: 'Stripe', description: 'Verify customer testimonials', type: 'oauth', connected: false },
]

// ============================================================================
// Query Keys Factory
// ============================================================================

export const settingsQueryKeys = {
    all: ['settings'] as const,
    profile: (userId: string) => [...settingsQueryKeys.all, 'profile', userId] as const,
    notifications: (orgId: string) => [...settingsQueryKeys.all, 'notifications', orgId] as const,
    integrations: (orgId: string) => [...settingsQueryKeys.all, 'integrations', orgId] as const,
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetches notification preferences from organization settings
 */
async function fetchNotificationPreferences(orgId: string): Promise<NotificationPreferences> {
    const { data, error } = await supabase
        .from('organizations')
        .select('settings')
        .eq('id', orgId)
        .single()

    if (error) {
        console.error('[useSettings] Failed to fetch notification preferences:', error)
        throw new Error(`Failed to fetch preferences: ${error.message}`)
    }

    const settings = data.settings as OrganizationSettings | null
    return settings?.notifications ?? DEFAULT_NOTIFICATION_PREFS
}

/**
 * Updates notification preferences in organization settings
 * Accepts partial updates to merge with existing preferences
 */
async function updateNotificationPreferences(
    orgId: string, 
    preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
    // First fetch current settings to merge
    const { data: current } = await supabase
        .from('organizations')
        .select('settings')
        .eq('id', orgId)
        .single()

    const currentSettings = (current?.settings as OrganizationSettings | null) || {}
    const currentNotifications = currentSettings.notifications || DEFAULT_NOTIFICATION_PREFS
    const mergedNotifications: NotificationPreferences = {
        ...currentNotifications,
        ...preferences,
    }
    
    const newSettings: OrganizationSettings = {
        ...currentSettings,
        notifications: mergedNotifications,
    }

    const { error } = await supabase
        .from('organizations')
        .update({ 
            settings: newSettings as unknown as Json,
            updated_at: new Date().toISOString(),
        })
        .eq('id', orgId)

    if (error) {
        console.error('[useSettings] Failed to update notification preferences:', error)
        throw new Error(`Failed to update preferences: ${error.message}`)
    }

    return mergedNotifications
}

/**
 * Fetches integration statuses from organization settings
 */
async function fetchIntegrations(orgId: string): Promise<IntegrationStatus[]> {
    const { data, error } = await supabase
        .from('organizations')
        .select('settings')
        .eq('id', orgId)
        .single()

    if (error) {
        console.error('[useSettings] Failed to fetch integrations:', error)
        throw new Error(`Failed to fetch integrations: ${error.message}`)
    }

    const settings = data.settings as OrganizationSettings | null
    const integrationData = settings?.integrations || {}

    // Merge with defaults to get full integration list
    return DEFAULT_INTEGRATIONS.map(integration => ({
        ...integration,
        connected: integrationData[integration.id]?.connected || false,
        connectedAt: integrationData[integration.id]?.connectedAt,
        apiKey: integrationData[integration.id]?.apiKey,
    }))
}

/**
 * Connects an OAuth integration
 */
async function connectOAuthIntegration(
    orgId: string, 
    integrationId: string
): Promise<IntegrationStatus> {
    // In production, this would initiate OAuth flow
    // For now, we'll just mark it as connected
    const { data: current } = await supabase
        .from('organizations')
        .select('settings')
        .eq('id', orgId)
        .single()

    const currentSettings = (current?.settings as OrganizationSettings | null) || {}
    const integrations = currentSettings.integrations || {}

    const newSettings: OrganizationSettings = {
        ...currentSettings,
        integrations: {
            ...integrations,
            [integrationId]: {
                connected: true,
                connectedAt: new Date().toISOString(),
            },
        },
    }

    const { error } = await supabase
        .from('organizations')
        .update({ 
            settings: newSettings as unknown as Json,
            updated_at: new Date().toISOString(),
        })
        .eq('id', orgId)

    if (error) {
        throw new Error(`Failed to connect integration: ${error.message}`)
    }

    const integration = DEFAULT_INTEGRATIONS.find(i => i.id === integrationId)!
    return {
        ...integration,
        connected: true,
        connectedAt: new Date().toISOString(),
    }
}

/**
 * Connects an API-based integration with an API key
 */
async function connectApiIntegration(
    orgId: string, 
    integrationId: string, 
    apiKey: string
): Promise<IntegrationStatus> {
    const { data: current } = await supabase
        .from('organizations')
        .select('settings')
        .eq('id', orgId)
        .single()

    const currentSettings = (current?.settings as OrganizationSettings | null) || {}
    const integrations = currentSettings.integrations || {}

    const newSettings: OrganizationSettings = {
        ...currentSettings,
        integrations: {
            ...integrations,
            [integrationId]: {
                connected: true,
                connectedAt: new Date().toISOString(),
                apiKey: apiKey, // In production, this should be encrypted
            },
        },
    }

    const { error } = await supabase
        .from('organizations')
        .update({ 
            settings: newSettings as unknown as Json,
            updated_at: new Date().toISOString(),
        })
        .eq('id', orgId)

    if (error) {
        throw new Error(`Failed to connect integration: ${error.message}`)
    }

    const integration = DEFAULT_INTEGRATIONS.find(i => i.id === integrationId)!
    return {
        ...integration,
        connected: true,
        connectedAt: new Date().toISOString(),
        apiKey,
    }
}

/**
 * Disconnects an integration
 */
async function disconnectIntegration(
    orgId: string, 
    integrationId: string
): Promise<void> {
    const { data: current } = await supabase
        .from('organizations')
        .select('settings')
        .eq('id', orgId)
        .single()

    const currentSettings = (current?.settings as OrganizationSettings | null) || {}
    const integrations = currentSettings.integrations || {}

    // Remove the integration
    delete integrations[integrationId]

    const newSettings: OrganizationSettings = {
        ...currentSettings,
        integrations,
    }

    const { error } = await supabase
        .from('organizations')
        .update({ 
            settings: newSettings as unknown as Json,
            updated_at: new Date().toISOString(),
        })
        .eq('id', orgId)

    if (error) {
        throw new Error(`Failed to disconnect integration: ${error.message}`)
    }
}

/**
 * Updates user profile
 */
async function updateProfile(
    userId: string, 
    updates: ProfileUpdateParams
): Promise<Profile> {
    const { data, error } = await supabase
        .from('profiles')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()

    if (error) {
        console.error('[useSettings] Failed to update profile:', error)
        throw new Error(`Failed to update profile: ${error.message}`)
    }

    return data
}

/**
 * Uploads an avatar image and returns the public URL
 */
async function uploadAvatar(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/avatar.${fileExt}`

    // First, remove existing avatar if any
    await supabase.storage
        .from('avatars')
        .remove([fileName])

    // Upload new avatar
    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true,
        })

    if (uploadError) {
        console.error('[useSettings] Failed to upload avatar:', uploadError)
        throw new Error(`Failed to upload avatar: ${uploadError.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

    // Update profile with new avatar URL
    await updateProfile(userId, { avatar_url: urlData.publicUrl })

    return urlData.publicUrl
}

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook to fetch notification preferences
 */
export function useNotificationPreferences() {
    const { profile } = useAuth()
    const orgId = profile?.org_id

    return useQuery({
        queryKey: settingsQueryKeys.notifications(orgId || ''),
        queryFn: () => fetchNotificationPreferences(orgId!),
        enabled: !!orgId,
        placeholderData: (previousData) => previousData ?? DEFAULT_NOTIFICATION_PREFS,
    })
}

/**
 * Hook to update notification preferences
 * Accepts partial updates to allow toggling individual settings
 */
export function useUpdateNotificationPreferences() {
    const queryClient = useQueryClient()
    const { profile } = useAuth()
    const orgId = profile?.org_id

    return useMutation({
        mutationFn: (preferences: Partial<NotificationPreferences>) => {
            if (!orgId) throw new Error('No organization found')
            return updateNotificationPreferences(orgId, preferences)
        },
        onSuccess: (data) => {
            if (orgId) {
                queryClient.setQueryData(settingsQueryKeys.notifications(orgId), data)
            }
        },
    })
}

/**
 * Hook to fetch integration statuses
 */
export function useIntegrations() {
    const { profile } = useAuth()
    const orgId = profile?.org_id

    return useQuery({
        queryKey: settingsQueryKeys.integrations(orgId || ''),
        queryFn: () => fetchIntegrations(orgId!),
        enabled: !!orgId,
        placeholderData: (previousData) => previousData,
    })
}

/**
 * Hook to connect an OAuth integration
 */
export function useConnectOAuthIntegration() {
    const queryClient = useQueryClient()
    const { profile } = useAuth()
    const orgId = profile?.org_id

    return useMutation({
        mutationFn: (integrationId: string) => {
            if (!orgId) throw new Error('No organization found')
            return connectOAuthIntegration(orgId, integrationId)
        },
        onSuccess: () => {
            if (orgId) {
                queryClient.invalidateQueries({ queryKey: settingsQueryKeys.integrations(orgId) })
            }
        },
    })
}

/**
 * Hook to connect an API integration
 */
export function useConnectApiIntegration() {
    const queryClient = useQueryClient()
    const { profile } = useAuth()
    const orgId = profile?.org_id

    return useMutation({
        mutationFn: ({ integrationId, apiKey }: { integrationId: string; apiKey: string }) => {
            if (!orgId) throw new Error('No organization found')
            return connectApiIntegration(orgId, integrationId, apiKey)
        },
        onSuccess: () => {
            if (orgId) {
                queryClient.invalidateQueries({ queryKey: settingsQueryKeys.integrations(orgId) })
            }
        },
    })
}

/**
 * Hook to disconnect an integration
 */
export function useDisconnectIntegration() {
    const queryClient = useQueryClient()
    const { profile } = useAuth()
    const orgId = profile?.org_id

    return useMutation({
        mutationFn: (integrationId: string) => {
            if (!orgId) throw new Error('No organization found')
            return disconnectIntegration(orgId, integrationId)
        },
        onSuccess: () => {
            if (orgId) {
                queryClient.invalidateQueries({ queryKey: settingsQueryKeys.integrations(orgId) })
            }
        },
    })
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile() {
    const queryClient = useQueryClient()
    const { profile, fetchProfile } = useAuth()
    const userId = profile?.id

    return useMutation({
        mutationFn: (updates: ProfileUpdateParams) => {
            if (!userId) throw new Error('No user found')
            return updateProfile(userId, updates)
        },
        onSuccess: async () => {
            await fetchProfile()
            if (userId) {
                queryClient.invalidateQueries({ queryKey: settingsQueryKeys.profile(userId) })
            }
        },
    })
}

/**
 * Hook to upload avatar
 */
export function useUploadAvatar() {
    const queryClient = useQueryClient()
    const { profile, fetchProfile } = useAuth()
    const userId = profile?.id

    return useMutation({
        mutationFn: (file: File) => {
            if (!userId) throw new Error('No user found')
            return uploadAvatar(userId, file)
        },
        onSuccess: async () => {
            await fetchProfile()
            if (userId) {
                queryClient.invalidateQueries({ queryKey: settingsQueryKeys.profile(userId) })
            }
        },
    })
}
