import { useState, useCallback } from 'react'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { MessageSquareQuote, Plus, Search, Loader2, AlertCircle } from 'lucide-react'
import { useTestimonials, useUpdateTestimonialStatus, useDeleteTestimonial, useCreateTestimonial } from '../hooks/useTestimonials'
import { useCurrentProject } from '../hooks/useProjects'
import { TestimonialCard } from '../components/testimonials/TestimonialCard'
import { AddTestimonialModal, type TestimonialFormData } from '../components/testimonials/AddTestimonialModal'
import type { TestimonialStatus } from '../hooks/useTestimonials'

type FilterStatus = TestimonialStatus | 'all'

const filterButtons: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'archived', label: 'Archived' },
]

export default function Testimonials() {
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)

    // Get current project from user's organization
    const { project, isLoading: projectLoading, hasProjects, hasOrg } = useCurrentProject()
    const projectId = project?.id || ''

    const { data: testimonials, isLoading, error } = useTestimonials({
        projectId,
        status: statusFilter,
        searchQuery,
    })

    const updateStatus = useUpdateTestimonialStatus()
    const deleteTestimonial = useDeleteTestimonial()
    const createTestimonial = useCreateTestimonial()

    const handleApprove = useCallback((id: string) => {
        updateStatus.mutate({ id, status: 'approved' })
    }, [updateStatus])

    const handleArchive = useCallback((id: string) => {
        updateStatus.mutate({ id, status: 'archived' })
    }, [updateStatus])

    const handleDelete = useCallback((id: string) => {
        deleteTestimonial.mutate(id)
    }, [deleteTestimonial])

    const handleCreateTestimonial = useCallback(async (formData: TestimonialFormData) => {
        await createTestimonial.mutateAsync({
            project_id: projectId,
            content_text: formData.content_text,
            author_name: formData.author_name,
            author_title: formData.author_title,
            author_company: formData.author_company,
            author_email: formData.author_email,
            author_avatar: formData.author_avatar,
            source: formData.source,
            rating: formData.rating,
        })
    }, [createTestimonial, projectId])

    return (
        <DashboardLayout>
            {/* Add Testimonial Modal */}
            <AddTestimonialModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleCreateTestimonial}
                isSubmitting={createTestimonial.isPending}
            />

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Testimonials</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and organize your customer testimonials.
                    </p>
                </div>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    disabled={!hasProjects}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                >
                    <Plus className="w-5 h-5" />
                    Add Testimonial
                </button>
            </div>

            {/* No Organization State */}
            {!projectLoading && !hasOrg && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 mb-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-foreground">No organization found</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Create an organization in Settings to start collecting testimonials.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* No Project State */}
            {!projectLoading && hasOrg && !hasProjects && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 mb-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-foreground">No project found</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Create a project in Settings to start collecting testimonials.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search testimonials..."
                        disabled={!hasProjects}
                        className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all disabled:opacity-50"
                    />
                </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-8">
                {filterButtons.map((filter) => (
                    <button
                        key={filter.value}
                        onClick={() => setStatusFilter(filter.value)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            statusFilter === filter.value
                                ? 'bg-amber-500 text-black'
                                : 'bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* Loading State */}
            {(isLoading || projectLoading) && hasProjects && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center" role="alert">
                    <p className="text-red-600 font-medium">Failed to load testimonials</p>
                    <p className="text-red-500 text-sm mt-1">Please try refreshing the page.</p>
                </div>
            )}

            {/* Testimonials Grid */}
            {!isLoading && !error && testimonials && testimonials.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.map((testimonial) => (
                        <TestimonialCard
                            key={testimonial.id}
                            testimonial={testimonial}
                            onApprove={handleApprove}
                            onArchive={handleArchive}
                            onDelete={handleDelete}
                            deleteConfirmId={deleteConfirmId}
                            onDeleteConfirm={setDeleteConfirmId}
                            isDeleting={deleteTestimonial.isPending}
                        />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && (!testimonials || testimonials.length === 0) && hasProjects && (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                    <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <MessageSquareQuote className="w-8 h-8 text-amber-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {statusFilter !== 'all' ? `No ${statusFilter} testimonials` : 'No testimonials yet'}
                    </h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        {statusFilter !== 'all'
                            ? `There are no testimonials with "${statusFilter}" status. Try a different filter.`
                            : 'Start collecting testimonials from your customers to showcase social proof on your website.'}
                    </p>
                    {statusFilter === 'all' && (
                        <button 
                            onClick={() => setIsAddModalOpen(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                        >
                            <Plus className="w-5 h-5" />
                            Add Your First Testimonial
                        </button>
                    )}
                </div>
            )}
        </DashboardLayout>
    )
}
