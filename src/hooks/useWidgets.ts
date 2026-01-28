import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/database'

export type Widget = Database['public']['Tables']['widgets']['Row']
export type WidgetType = Database['public']['Enums']['widget_type']
export type WidgetInsert = Database['public']['Tables']['widgets']['Insert']
export type WidgetUpdate = Database['public']['Tables']['widgets']['Update']

export interface WidgetConfig {
    accentColor: string
    showAvatars: boolean
    showRatings: boolean
    showCompanyLogos: boolean
    maxTestimonials: number
    columns: number
    spacing: 'compact' | 'normal' | 'relaxed'
    borderRadius: 'none' | 'small' | 'medium' | 'large'
    filterTags: string[]
    filterStatus: 'approved' | 'all'
    sortBy: 'newest' | 'highest_quality' | 'random'
}

export interface WidgetRule {
    id: string
    condition: 'url_contains' | 'url_equals' | 'referrer_contains'
    value: string
    action: 'show_tag' | 'hide_tag'
    tagValue: string
}

export const defaultWidgetConfig: WidgetConfig = {
    accentColor: '#f59e0b',
    showAvatars: true,
    showRatings: true,
    showCompanyLogos: false,
    maxTestimonials: 6,
    columns: 3,
    spacing: 'normal',
    borderRadius: 'medium',
    filterTags: [],
    filterStatus: 'approved',
    sortBy: 'newest',
}

async function fetchWidgets(projectId: string) {
    const { data, error } = await supabase
        .from('widgets')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

async function createWidget(widget: WidgetInsert) {
    const { data, error } = await supabase
        .from('widgets')
        .insert(widget)
        .select()
        .single()

    if (error) throw error
    return data
}

async function updateWidget({ id, ...updates }: WidgetUpdate & { id: string }) {
    const { data, error } = await supabase
        .from('widgets')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

async function deleteWidget(id: string) {
    const { error } = await supabase
        .from('widgets')
        .delete()
        .eq('id', id)

    if (error) throw error
    return id
}

async function toggleWidgetActive(id: string, isActive: boolean) {
    const { data, error } = await supabase
        .from('widgets')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

export function useWidgets(projectId: string) {
    return useQuery({
        queryKey: ['widgets', projectId],
        queryFn: () => fetchWidgets(projectId),
        enabled: !!projectId,
        refetchInterval: 30000, // Real-time updates every 30s
    })
}

export function useCreateWidget() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createWidget,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['widgets', data.project_id] })
        },
    })
}

export function useUpdateWidget() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: updateWidget,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['widgets', data.project_id] })
        },
    })
}

export function useDeleteWidget() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteWidget,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['widgets'] })
        },
    })
}

export function useToggleWidgetActive() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
            toggleWidgetActive(id, isActive),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['widgets'] })
        },
    })
}

export function generateEmbedCode(widgetId: string): string {
    return `<script src="https://cdn.wallify.io/widget.js" data-widget-id="${widgetId}" async></script>
<div id="wallify-widget-${widgetId}"></div>`
}
