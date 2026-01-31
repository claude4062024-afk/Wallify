/**
 * useConnections Hook
 * 
 * Manages social account connections for auto-collecting testimonials
 * from platforms like Twitter, LinkedIn, G2, and ProductHunt.
 * 
 * @module hooks/useConnections
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

// ============================================================================
// Type Definitions
// ============================================================================

export type ConnectionPlatform = 'twitter' | 'linkedin' | 'g2' | 'producthunt'

export type ConnectionStatus = 'active' | 'expired' | 'pending' | 'revoked'

export interface Connection {
    id: string
    project_id: string
    platform: ConnectionPlatform
    status: ConnectionStatus
    account_handle: string | null
    account_name: string | null
    account_avatar: string | null
    access_token_encrypted: string | null
    refresh_token_encrypted: string | null
    token_expires_at: string | null
    last_scraped_at: string | null
    scrape_count: number
    scrape_config: unknown | null
    created_at: string
    updated_at: string
}

export interface ConnectionInsert {
    project_id: string
    platform: ConnectionPlatform
    status?: ConnectionStatus
    account_handle?: string | null
    account_name?: string | null
    account_avatar?: string | null
    access_token_encrypted?: string | null
    refresh_token_encrypted?: string | null
    token_expires_at?: string | null
}

export interface PlatformInfo {
    id: ConnectionPlatform
    name: string
    description: string
    icon: string
    color: string
    bgColor: string
    available: boolean
}

// ============================================================================
// Platform Configuration
// ============================================================================

export const platforms: PlatformInfo[] = [
    {
        id: 'twitter',
        name: 'Twitter / X',
        description: 'Collect mentions, replies, and positive tweets about your brand',
        icon: 'twitter',
        color: '#1DA1F2',
        bgColor: 'bg-[#1DA1F2]/10',
        available: true,
    },
    {
        id: 'linkedin',
        name: 'LinkedIn',
        description: 'Find recommendations and positive posts from your network',
        icon: 'linkedin',
        color: '#0A66C2',
        bgColor: 'bg-[#0A66C2]/10',
        available: true,
    },
    {
        id: 'g2',
        name: 'G2',
        description: 'Import verified customer reviews from G2 Crowd',
        icon: 'g2',
        color: '#FF492C',
        bgColor: 'bg-[#FF492C]/10',
        available: true,
    },
    {
        id: 'producthunt',
        name: 'Product Hunt',
        description: 'Collect reviews and comments from your Product Hunt launch',
        icon: 'producthunt',
        color: '#DA552F',
        bgColor: 'bg-[#DA552F]/10',
        available: false,
    },
]

// ============================================================================
// Query Keys Factory
// ============================================================================

export const connectionQueryKeys = {
    all: ['connections'] as const,
    lists: () => [...connectionQueryKeys.all, 'list'] as const,
    list: (projectId: string) => [...connectionQueryKeys.lists(), projectId] as const,
    detail: (id: string) => [...connectionQueryKeys.all, 'detail', id] as const,
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetches all connections for a project
 */
async function fetchConnections(projectId: string): Promise<Connection[]> {
    const { data, error } = await supabase
        .from('connections')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('[useConnections] Failed to fetch connections:', error)
        throw new Error(`Failed to fetch connections: ${error.message}`)
    }

    return (data || []) as unknown as Connection[]
}

/**
 * Initiates OAuth connection for a platform
 */
async function initiateOAuthConnection(projectId: string, platform: ConnectionPlatform): Promise<string> {
    // For now, we'll create a pending connection and return the OAuth URL
    // In production, this would redirect to the platform's OAuth flow
    const redirectUrl = `${window.location.origin}/auth/callback?platform=${platform}`
    
    const { data, error } = await supabase
        .from('connections')
        .insert({
            project_id: projectId,
            platform,
            status: 'pending',
        })
        .select()
        .single()

    if (error) {
        console.error('[useConnections] Failed to create connection:', error)
        throw new Error(`Failed to initiate connection: ${error.message}`)
    }

    // Return OAuth URL (mock for now)
    const oauthUrls: Record<ConnectionPlatform, string> = {
        twitter: `https://twitter.com/i/oauth2/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=${encodeURIComponent(redirectUrl)}&scope=tweet.read%20users.read&state=${data.id}`,
        linkedin: `https://www.linkedin.com/oauth/v2/authorization?client_id=YOUR_CLIENT_ID&redirect_uri=${encodeURIComponent(redirectUrl)}&scope=r_liteprofile%20r_emailaddress&state=${data.id}`,
        g2: redirectUrl, // G2 uses API keys, not OAuth
        producthunt: `https://api.producthunt.com/v2/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=${encodeURIComponent(redirectUrl)}&scope=public&state=${data.id}`,
    }

    return oauthUrls[platform]
}

/**
 * Removes a connection
 */
async function removeConnection(connectionId: string): Promise<void> {
    const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId)

    if (error) {
        console.error('[useConnections] Failed to remove connection:', error)
        throw new Error(`Failed to remove connection: ${error.message}`)
    }
}

/**
 * Triggers a manual scrape for a connection
 */
async function triggerScrape(connectionId: string): Promise<void> {
    // In production, this would call the scraper service API
    // For now, we'll just update the last_scraped_at timestamp
    const { error } = await supabase
        .from('connections')
        .update({ 
            last_scraped_at: new Date().toISOString()
        })
        .eq('id', connectionId)

    if (error) {
        console.error('[useConnections] Failed to trigger scrape:', error)
        throw new Error(`Failed to trigger scrape: ${error.message}`)
    }
    
    // Try to increment scrape count via RPC (optional, may not exist)
    try {
        await supabase.rpc('increment_scrape_count', { p_connection_id: connectionId })
    } catch {
        // RPC may not exist yet, silently ignore
    }
}

/**
 * Updates connection status after OAuth callback
 */
async function activateConnection(
    connectionId: string, 
    tokens: { 
        access_token: string
        refresh_token?: string
        expires_in?: number
        account_handle?: string
        account_name?: string
        account_avatar?: string
    }
): Promise<Connection> {
    const updateData = {
        status: 'active' as const,
        access_token_encrypted: tokens.access_token,
        refresh_token_encrypted: tokens.refresh_token || null,
        account_handle: tokens.account_handle || null,
        account_name: tokens.account_name || null,
        account_avatar: tokens.account_avatar || null,
        updated_at: new Date().toISOString(),
        token_expires_at: tokens.expires_in 
            ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() 
            : undefined,
    }

    const { data, error } = await supabase
        .from('connections')
        .update(updateData)
        .eq('id', connectionId)
        .select()
        .single()

    if (error) {
        console.error('[useConnections] Failed to activate connection:', error)
        throw new Error(`Failed to activate connection: ${error.message}`)
    }

    return data as unknown as Connection
}

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook to fetch connections for the current project
 */
export function useConnections(projectId: string) {
    return useQuery({
        queryKey: connectionQueryKeys.list(projectId),
        queryFn: () => fetchConnections(projectId),
        enabled: !!projectId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

/**
 * Hook to initiate a new OAuth connection
 */
export function useInitiateConnection() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ projectId, platform }: { projectId: string; platform: ConnectionPlatform }) =>
            initiateOAuthConnection(projectId, platform),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: connectionQueryKeys.list(projectId) })
        },
    })
}

/**
 * Hook to remove a connection
 */
export function useRemoveConnection() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: removeConnection,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: connectionQueryKeys.all })
        },
    })
}

/**
 * Hook to trigger a manual scrape
 */
export function useTriggerScrape() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: triggerScrape,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: connectionQueryKeys.all })
        },
    })
}

/**
 * Hook to activate a connection after OAuth
 */
export function useActivateConnection() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ connectionId, tokens }: { 
            connectionId: string
            tokens: Parameters<typeof activateConnection>[1] 
        }) => activateConnection(connectionId, tokens),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: connectionQueryKeys.all })
        },
    })
}

/**
 * Helper hook to get connection for a specific platform
 */
export function useConnectionByPlatform(projectId: string, platform: ConnectionPlatform) {
    const { data: connections, ...rest } = useConnections(projectId)
    
    const connection = connections?.find(c => c.platform === platform && c.status === 'active')
    
    return {
        ...rest,
        connection,
        isConnected: !!connection,
    }
}
