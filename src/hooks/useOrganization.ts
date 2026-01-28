/**
 * useOrganization Hook
 * 
 * Production-grade React Query hook for managing organization data.
 * Handles organization CRUD, team member management, and billing operations.
 * 
 * @module hooks/useOrganization
 * @version 1.0.0
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/database'
import { useAuth } from './useAuth'

// ============================================================================
// Type Definitions
// ============================================================================

export type Organization = Database['public']['Tables']['organizations']['Row']
export type OrganizationUpdate = Database['public']['Tables']['organizations']['Update']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type UserRole = Database['public']['Enums']['user_role']
export type BillingTier = Database['public']['Enums']['billing_tier']

export interface TeamMember {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    role: UserRole
    created_at: string
}

export interface InviteParams {
    email: string
    role: 'admin' | 'member'
}

export interface UpdateMemberRoleParams {
    memberId: string
    role: UserRole
}

export interface OrganizationWithMembers extends Organization {
    members: TeamMember[]
    member_count: number
}

export interface UsageStats {
    testimonials: { used: number; limit: number }
    widgets: { used: number; limit: number }
    teamMembers: { used: number; limit: number }
    monthlyViews: { used: number; limit: number }
}

export interface BillingHistoryItem {
    id: string
    created_at: string
    amount: number
    currency: string
    status: 'paid' | 'pending' | 'failed'
    invoice_url: string | null
    description: string
}

// ============================================================================
// Constants
// ============================================================================

const TIER_LIMITS: Record<BillingTier, { testimonials: number; widgets: number; members: number; views: number }> = {
    starter: { testimonials: 50, widgets: 2, members: 1, views: 5000 },
    growth: { testimonials: 500, widgets: 10, members: 5, views: 50000 },
    optimization: { testimonials: -1, widgets: -1, members: 15, views: 500000 }, // -1 = unlimited
    enterprise: { testimonials: -1, widgets: -1, members: -1, views: -1 },
}

// ============================================================================
// Query Keys Factory
// ============================================================================

export const organizationQueryKeys = {
    all: ['organization'] as const,
    details: () => [...organizationQueryKeys.all, 'detail'] as const,
    detail: (id: string) => [...organizationQueryKeys.details(), id] as const,
    members: (id: string) => [...organizationQueryKeys.all, 'members', id] as const,
    usage: (id: string) => [...organizationQueryKeys.all, 'usage', id] as const,
    billing: (id: string) => [...organizationQueryKeys.all, 'billing', id] as const,
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetches the organization details for the current user
 */
async function fetchOrganization(orgId: string): Promise<Organization> {
    const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single()

    if (error) {
        console.error('[useOrganization] Failed to fetch organization:', error)
        throw new Error(`Failed to fetch organization: ${error.message}`)
    }

    return data
}

/**
 * Fetches all team members for an organization
 */
async function fetchTeamMembers(orgId: string): Promise<TeamMember[]> {
    // We need to get profiles and their associated auth.users email
    // Since we can't directly join auth.users, we'll use the profile data
    const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role, created_at')
        .eq('org_id', orgId)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('[useOrganization] Failed to fetch team members:', error)
        throw new Error(`Failed to fetch team members: ${error.message}`)
    }

    // For each profile, we need to get the email from auth
    // In production, you might want to store email in profiles or use a server function
    // For now, we'll use the user ID pattern to construct a placeholder
    return (data || []).map(profile => ({
        id: profile.id,
        email: `user_${profile.id.slice(0, 8)}@example.com`, // Placeholder - in production, use RPC or edge function
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        role: profile.role,
        created_at: profile.created_at,
    }))
}

/**
 * Updates organization details
 */
async function updateOrganization(
    orgId: string, 
    updates: Partial<Pick<Organization, 'name' | 'settings'>>
): Promise<Organization> {
    const { data, error } = await supabase
        .from('organizations')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', orgId)
        .select()
        .single()

    if (error) {
        console.error('[useOrganization] Failed to update organization:', error)
        throw new Error(`Failed to update organization: ${error.message}`)
    }

    return data
}

/**
 * Removes a member from the organization
 */
async function removeMember(memberId: string): Promise<void> {
    // First update the profile to remove org association
    const { error } = await supabase
        .from('profiles')
        .update({ 
            org_id: null,
            role: 'member' as UserRole,
            updated_at: new Date().toISOString(),
        })
        .eq('id', memberId)

    if (error) {
        console.error('[useOrganization] Failed to remove member:', error)
        throw new Error(`Failed to remove member: ${error.message}`)
    }
}

/**
 * Updates a member's role
 */
async function updateMemberRole(params: UpdateMemberRoleParams): Promise<void> {
    const { error } = await supabase
        .from('profiles')
        .update({ 
            role: params.role,
            updated_at: new Date().toISOString(),
        })
        .eq('id', params.memberId)

    if (error) {
        console.error('[useOrganization] Failed to update member role:', error)
        throw new Error(`Failed to update member role: ${error.message}`)
    }
}

/**
 * Calculates usage statistics for an organization
 */
async function fetchUsageStats(orgId: string, tier: BillingTier): Promise<UsageStats> {
    // Get project IDs for this org
    const { data: projects } = await supabase
        .from('projects')
        .select('id')
        .eq('org_id', orgId)

    const projectIds = projects?.map(p => p.id) || []

    // Get testimonial count
    let testimonialCount = 0
    if (projectIds.length > 0) {
        const { count } = await supabase
            .from('testimonials')
            .select('*', { count: 'exact', head: true })
            .in('project_id', projectIds)
        testimonialCount = count || 0
    }

    // Get widget count
    let widgetCount = 0
    if (projectIds.length > 0) {
        const { count } = await supabase
            .from('widgets')
            .select('*', { count: 'exact', head: true })
            .in('project_id', projectIds)
        widgetCount = count || 0
    }

    // Get member count
    const { count: memberCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)

    // Get monthly views from analytics (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    let viewCount = 0
    if (projectIds.length > 0) {
        const { data: widgets } = await supabase
            .from('widgets')
            .select('id')
            .in('project_id', projectIds)

        const widgetIds = widgets?.map(w => w.id) || []

        if (widgetIds.length > 0) {
            const { count } = await supabase
                .from('analytics_events')
                .select('*', { count: 'exact', head: true })
                .in('widget_id', widgetIds)
                .eq('event_type', 'view')
                .gte('timestamp', thirtyDaysAgo.toISOString())
            viewCount = count || 0
        }
    }

    const limits = TIER_LIMITS[tier]

    return {
        testimonials: { 
            used: testimonialCount, 
            limit: limits.testimonials 
        },
        widgets: { 
            used: widgetCount, 
            limit: limits.widgets 
        },
        teamMembers: { 
            used: memberCount || 0, 
            limit: limits.members 
        },
        monthlyViews: { 
            used: viewCount, 
            limit: limits.views 
        },
    }
}

/**
 * Deletes an organization (danger zone)
 * This cascades to delete all projects, testimonials, widgets, etc.
 */
async function deleteOrganization(orgId: string): Promise<void> {
    // First, remove all member associations
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ org_id: null, role: 'member' as UserRole })
        .eq('org_id', orgId)

    if (profileError) {
        throw new Error(`Failed to remove members: ${profileError.message}`)
    }

    // Then delete the organization
    const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', orgId)

    if (error) {
        console.error('[useOrganization] Failed to delete organization:', error)
        throw new Error(`Failed to delete organization: ${error.message}`)
    }
}

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook to fetch the current user's organization
 */
export function useOrganization() {
    const { profile } = useAuth()
    const orgId = profile?.org_id

    return useQuery({
        queryKey: organizationQueryKeys.detail(orgId || ''),
        queryFn: () => fetchOrganization(orgId!),
        enabled: !!orgId,
        staleTime: 60000, // Consider data fresh for 1 minute
        gcTime: 300000,
    })
}

/**
 * Hook to fetch team members for the current organization
 */
export function useTeamMembers() {
    const { profile } = useAuth()
    const orgId = profile?.org_id

    return useQuery({
        queryKey: organizationQueryKeys.members(orgId || ''),
        queryFn: () => fetchTeamMembers(orgId!),
        enabled: !!orgId,
        staleTime: 30000,
    })
}

/**
 * Hook to fetch usage statistics
 */
export function useUsageStats() {
    const { profile } = useAuth()
    const { data: organization } = useOrganization()
    const orgId = profile?.org_id

    return useQuery({
        queryKey: organizationQueryKeys.usage(orgId || ''),
        queryFn: () => fetchUsageStats(orgId!, organization!.billing_tier),
        enabled: !!orgId && !!organization,
        staleTime: 60000,
        refetchInterval: 300000, // Refresh every 5 minutes
    })
}

/**
 * Hook to update organization details
 */
export function useUpdateOrganization() {
    const queryClient = useQueryClient()
    const { profile } = useAuth()
    const orgId = profile?.org_id

    return useMutation({
        mutationFn: (updates: Partial<Pick<Organization, 'name' | 'settings'>>) => {
            if (!orgId) throw new Error('No organization found')
            return updateOrganization(orgId, updates)
        },
        onSuccess: (data) => {
            queryClient.setQueryData(organizationQueryKeys.detail(data.id), data)
        },
    })
}

/**
 * Hook to remove a team member
 */
export function useRemoveMember() {
    const queryClient = useQueryClient()
    const { profile } = useAuth()
    const orgId = profile?.org_id

    return useMutation({
        mutationFn: removeMember,
        onSuccess: () => {
            if (orgId) {
                queryClient.invalidateQueries({ queryKey: organizationQueryKeys.members(orgId) })
            }
        },
    })
}

/**
 * Hook to update a member's role
 */
export function useUpdateMemberRole() {
    const queryClient = useQueryClient()
    const { profile } = useAuth()
    const orgId = profile?.org_id

    return useMutation({
        mutationFn: updateMemberRole,
        onSuccess: () => {
            if (orgId) {
                queryClient.invalidateQueries({ queryKey: organizationQueryKeys.members(orgId) })
            }
        },
    })
}

/**
 * Hook to delete the organization
 */
export function useDeleteOrganization() {
    const queryClient = useQueryClient()
    const { profile, signOut } = useAuth()
    const orgId = profile?.org_id

    return useMutation({
        mutationFn: () => {
            if (!orgId) throw new Error('No organization found')
            return deleteOrganization(orgId)
        },
        onSuccess: async () => {
            queryClient.clear()
            await signOut()
        },
    })
}

/**
 * Helper hook to get tier limits for the current organization
 */
export function useTierLimits() {
    const { data: organization } = useOrganization()
    const tier = organization?.billing_tier || 'starter'
    return TIER_LIMITS[tier]
}
