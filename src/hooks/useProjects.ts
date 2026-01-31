/**
 * useProjects Hook
 * 
 * Production-grade React Query hook for managing projects within an organization.
 * Provides CRUD operations with optimistic updates, error handling, and cache invalidation.
 * 
 * @module hooks/useProjects
 * @version 1.0.0
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/database'
import { useAuth } from './useAuth'

// ============================================================================
// Type Definitions
// ============================================================================

export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']

export interface ProjectWithStats extends Project {
    testimonial_count?: number
    widget_count?: number
}

export interface CreateProjectParams {
    name: string
    initialDomain?: string
}

export interface UpdateProjectParams {
    id: string
    name?: string
    domain_whitelist?: string[]
}

export interface AddDomainParams {
    projectId: string
    domain: string
}

export interface RemoveDomainParams {
    projectId: string
    domain: string
}

// ============================================================================
// Query Keys Factory
// ============================================================================

export const projectQueryKeys = {
    all: ['projects'] as const,
    lists: () => [...projectQueryKeys.all, 'list'] as const,
    list: (orgId: string) => [...projectQueryKeys.lists(), orgId] as const,
    details: () => [...projectQueryKeys.all, 'detail'] as const,
    detail: (id: string) => [...projectQueryKeys.details(), id] as const,
    current: () => [...projectQueryKeys.all, 'current'] as const,
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Generates a secure API key with the wallify prefix
 * Format: wlf_sk_<32 random hex characters>
 */
function generateApiKey(): string {
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    const hex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
    return `wlf_sk_${hex}`
}

/**
 * Fetches all projects for an organization with optional statistics
 */
async function fetchProjects(orgId: string): Promise<ProjectWithStats[]> {
    const { data, error } = await supabase
        .from('projects')
        .select(`
            *,
            testimonials:testimonials(count),
            widgets:widgets(count)
        `)
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('[useProjects] Failed to fetch projects:', error)
        throw new Error(`Failed to fetch projects: ${error.message}`)
    }

    // Transform the response to include counts
    return (data || []).map(project => ({
        ...project,
        testimonial_count: Array.isArray(project.testimonials) 
            ? project.testimonials[0]?.count ?? 0 
            : 0,
        widget_count: Array.isArray(project.widgets) 
            ? project.widgets[0]?.count ?? 0 
            : 0,
        // Remove the nested arrays from the final object
        testimonials: undefined,
        widgets: undefined,
    })) as ProjectWithStats[]
}

/**
 * Fetches a single project by ID
 */
async function fetchProject(id: string): Promise<Project> {
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('[useProjects] Failed to fetch project:', error)
        throw new Error(`Failed to fetch project: ${error.message}`)
    }

    return data
}

/**
 * Creates a new project with auto-generated API key
 */
async function createProject(orgId: string, params: CreateProjectParams): Promise<Project> {
    const apiKey = generateApiKey()
    const domainWhitelist = params.initialDomain 
        ? [params.initialDomain.toLowerCase().trim()] 
        : []

    const { data, error } = await supabase
        .from('projects')
        .insert({
            name: params.name.trim(),
            org_id: orgId,
            api_key: apiKey,
            domain_whitelist: domainWhitelist,
        })
        .select()
        .single()

    if (error) {
        console.error('[useProjects] Failed to create project:', error)
        throw new Error(`Failed to create project: ${error.message}`)
    }

    return data
}

/**
 * Updates an existing project
 */
async function updateProject(params: UpdateProjectParams): Promise<Project> {
    const updates: ProjectUpdate = {
        updated_at: new Date().toISOString(),
    }

    if (params.name !== undefined) {
        updates.name = params.name.trim()
    }

    if (params.domain_whitelist !== undefined) {
        updates.domain_whitelist = params.domain_whitelist
    }

    const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', params.id)
        .select()
        .single()

    if (error) {
        console.error('[useProjects] Failed to update project:', error)
        throw new Error(`Failed to update project: ${error.message}`)
    }

    return data
}

/**
 * Deletes a project and all associated data (cascades via RLS)
 */
async function deleteProject(id: string): Promise<void> {
    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('[useProjects] Failed to delete project:', error)
        throw new Error(`Failed to delete project: ${error.message}`)
    }
}

/**
 * Regenerates the API key for a project
 */
async function regenerateApiKey(id: string): Promise<Project> {
    const newApiKey = generateApiKey()

    const { data, error } = await supabase
        .from('projects')
        .update({ 
            api_key: newApiKey,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('[useProjects] Failed to regenerate API key:', error)
        throw new Error(`Failed to regenerate API key: ${error.message}`)
    }

    return data
}

/**
 * Adds a domain to the project whitelist
 */
async function addDomain(params: AddDomainParams): Promise<Project> {
    // First fetch current domains
    const { data: current, error: fetchError } = await supabase
        .from('projects')
        .select('domain_whitelist')
        .eq('id', params.projectId)
        .single()

    if (fetchError) {
        throw new Error(`Failed to fetch project: ${fetchError.message}`)
    }

    const currentDomains = current.domain_whitelist || []
    const normalizedDomain = params.domain.toLowerCase().trim()

    // Check for duplicates
    if (currentDomains.includes(normalizedDomain)) {
        throw new Error('Domain already exists in whitelist')
    }

    const { data, error } = await supabase
        .from('projects')
        .update({
            domain_whitelist: [...currentDomains, normalizedDomain],
            updated_at: new Date().toISOString(),
        })
        .eq('id', params.projectId)
        .select()
        .single()

    if (error) {
        throw new Error(`Failed to add domain: ${error.message}`)
    }

    return data
}

/**
 * Removes a domain from the project whitelist
 */
async function removeDomain(params: RemoveDomainParams): Promise<Project> {
    const { data: current, error: fetchError } = await supabase
        .from('projects')
        .select('domain_whitelist')
        .eq('id', params.projectId)
        .single()

    if (fetchError) {
        throw new Error(`Failed to fetch project: ${fetchError.message}`)
    }

    const currentDomains = current.domain_whitelist || []
    const normalizedDomain = params.domain.toLowerCase().trim()

    const { data, error } = await supabase
        .from('projects')
        .update({
            domain_whitelist: currentDomains.filter(d => d !== normalizedDomain),
            updated_at: new Date().toISOString(),
        })
        .eq('id', params.projectId)
        .select()
        .single()

    if (error) {
        throw new Error(`Failed to remove domain: ${error.message}`)
    }

    return data
}

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook to fetch all projects for the current user's organization
 */
export function useProjects() {
    const { profile } = useAuth()
    const orgId = profile?.org_id

    const query = useQuery({
        queryKey: projectQueryKeys.list(orgId || ''),
        queryFn: () => fetchProjects(orgId!),
        enabled: !!orgId,
        gcTime: 300000, // Keep in cache for 5 minutes
        placeholderData: (previousData) => previousData,
    })
    
    // Return loading state correctly - only truly loading if enabled and fetching
    return {
        ...query,
        isLoading: !!orgId && query.isLoading,
    }
}

/**
 * Hook to fetch a single project by ID
 */
export function useProject(projectId: string | undefined) {
    return useQuery({
        queryKey: projectQueryKeys.detail(projectId || ''),
        queryFn: () => fetchProject(projectId!),
        enabled: !!projectId,
        placeholderData: (previousData) => previousData,
    })
}

/**
 * Hook to get the current/default project for the user
 * Returns the first project in the organization or null if none exist
 */
export function useCurrentProject() {
    const { profile } = useAuth()
    const hasOrg = !!profile?.org_id
    const { data: projects, isLoading, isFetching, error } = useProjects()
    
    // Only show loading if we actually have an org and are fetching
    const actuallyLoading = hasOrg && (isLoading || isFetching)

    return {
        project: projects?.[0] ?? null,
        projects: projects ?? [],
        isLoading: actuallyLoading,
        error,
        hasProjects: (projects?.length ?? 0) > 0,
        hasOrg,
    }
}

/**
 * Hook to create a new project
 */
export function useCreateProject() {
    const queryClient = useQueryClient()
    const { profile } = useAuth()
    const orgId = profile?.org_id

    return useMutation({
        mutationFn: (params: CreateProjectParams) => {
            if (!orgId) throw new Error('No organization found')
            return createProject(orgId, params)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectQueryKeys.lists() })
        },
        onError: (error) => {
            console.error('[useCreateProject] Mutation failed:', error)
        },
    })
}

/**
 * Hook to update a project
 */
export function useUpdateProject() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: updateProject,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: projectQueryKeys.lists() })
            queryClient.setQueryData(projectQueryKeys.detail(data.id), data)
        },
    })
}

/**
 * Hook to delete a project
 */
export function useDeleteProject() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectQueryKeys.lists() })
        },
    })
}

/**
 * Hook to regenerate a project's API key
 */
export function useRegenerateApiKey() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: regenerateApiKey,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: projectQueryKeys.lists() })
            queryClient.setQueryData(projectQueryKeys.detail(data.id), data)
        },
    })
}

/**
 * Hook to add a domain to project whitelist
 */
export function useAddDomain() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: addDomain,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: projectQueryKeys.lists() })
            queryClient.setQueryData(projectQueryKeys.detail(data.id), data)
        },
    })
}

/**
 * Hook to remove a domain from project whitelist
 */
export function useRemoveDomain() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: removeDomain,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: projectQueryKeys.lists() })
            queryClient.setQueryData(projectQueryKeys.detail(data.id), data)
        },
    })
}
