import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/database'

type Testimonial = Database['public']['Tables']['testimonials']['Row']
type TestimonialStatus = Database['public']['Enums']['testimonial_status']

interface TestimonialsFilters {
    projectId: string
    status?: TestimonialStatus | 'all'
    searchQuery?: string
}

async function fetchTestimonials({ projectId, status, searchQuery }: TestimonialsFilters) {
    let query = supabase
        .from('testimonials')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

    if (status && status !== 'all') {
        query = query.eq('status', status)
    }

    if (searchQuery && searchQuery.trim()) {
        query = query.or(`author_name.ilike.%${searchQuery}%,content_text.ilike.%${searchQuery}%,author_company.ilike.%${searchQuery}%`)
    }

    const { data, error } = await query

    if (error) throw error
    return data
}

async function updateTestimonialStatus(id: string, status: TestimonialStatus) {
    const { data, error } = await supabase
        .from('testimonials')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

async function deleteTestimonial(id: string) {
    const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id)

    if (error) throw error
    return id
}

export function useTestimonials(filters: TestimonialsFilters) {
    return useQuery({
        queryKey: ['testimonials', filters],
        queryFn: () => fetchTestimonials(filters),
        enabled: !!filters.projectId,
    })
}

export function useUpdateTestimonialStatus(projectId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: TestimonialStatus }) =>
            updateTestimonialStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['testimonials'] })
        },
    })
}

export function useDeleteTestimonial(projectId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => deleteTestimonial(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['testimonials'] })
        },
    })
}

export type { Testimonial, TestimonialStatus, TestimonialsFilters }
