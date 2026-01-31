import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/database'

type Testimonial = Database['public']['Tables']['testimonials']['Row']
type TestimonialInsert = Database['public']['Tables']['testimonials']['Insert']
type TestimonialStatus = Database['public']['Enums']['testimonial_status']
type TestimonialSource = Database['public']['Enums']['testimonial_source']

interface TestimonialsFilters {
    projectId: string
    status?: TestimonialStatus | 'all'
    searchQuery?: string
}

interface CreateTestimonialData {
    project_id: string
    content_text: string
    author_name: string
    author_title?: string | null
    author_company?: string | null
    author_email?: string | null
    author_avatar?: string | null
    source?: TestimonialSource
    rating?: number | null
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

export function useCreateTestimonial() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: CreateTestimonialData) => {
            const insertData: TestimonialInsert = {
                project_id: data.project_id,
                content_text: data.content_text,
                author_name: data.author_name,
                author_title: data.author_title || null,
                author_company: data.author_company || null,
                author_email: data.author_email || null,
                author_avatar: data.author_avatar || null,
                source: data.source || 'direct',
                rating: data.rating || null,
                status: 'pending',
                verification_status: 'unverified',
            }

            const { data: testimonial, error } = await supabase
                .from('testimonials')
                .insert(insertData)
                .select()
                .single()

            if (error) throw new Error(error.message)
            return testimonial
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['testimonials'] })
        },
    })
}

export function useUpdateTestimonialStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: TestimonialStatus }) =>
            updateTestimonialStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['testimonials'] })
        },
    })
}

export function useDeleteTestimonial() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => deleteTestimonial(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['testimonials'] })
        },
    })
}

export type { Testimonial, TestimonialStatus, TestimonialsFilters, CreateTestimonialData, TestimonialSource }
