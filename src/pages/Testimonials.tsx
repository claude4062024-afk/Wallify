import { useState } from 'react'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { MessageSquareQuote, Plus, Search, Check, Archive, Trash2, Star, Loader2, AlertCircle } from 'lucide-react'
import { useTestimonials, useUpdateTestimonialStatus, useDeleteTestimonial } from '../hooks/useTestimonials'
import { useCurrentProject } from '../hooks/useProjects'
import type { TestimonialStatus } from '../hooks/useTestimonials'

type FilterStatus = TestimonialStatus | 'all'

const statusConfig: Record<TestimonialStatus, { label: string; className: string }> = {
    approved: { label: 'Approved', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    pending: { label: 'Pending', className: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    archived: { label: 'Archived', className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
    rejected: { label: 'Rejected', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
}

const filterButtons: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'archived', label: 'Archived' },
]

function getInitials(name: string | null): string {
    if (!name) return '?'
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

export default function Testimonials() {
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

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

    const handleApprove = (id: string) => {
        updateStatus.mutate({ id, status: 'approved' })
    }

    const handleArchive = (id: string) => {
        updateStatus.mutate({ id, status: 'archived' })
    }

    const handleDelete = (id: string) => {
        if (deleteConfirmId === id) {
            deleteTestimonial.mutate(id)
            setDeleteConfirmId(null)
        } else {
            setDeleteConfirmId(id)
            // Auto-reset confirmation after 3 seconds
            setTimeout(() => setDeleteConfirmId(null), 3000)
        }
    }

    return (
        <DashboardLayout>
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Testimonials</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and organize your customer testimonials.
                    </p>
                </div>
                <button 
                    disabled={!hasProjects}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                    <p className="text-red-400">Failed to load testimonials. Please try again.</p>
                </div>
            )}

            {/* Testimonials Grid */}
            {!isLoading && !error && testimonials && testimonials.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                        >
                            {/* Author Info */}
                            <div className="flex items-start gap-3 mb-4">
                                {testimonial.author_avatar ? (
                                    <img
                                        src={testimonial.author_avatar}
                                        alt={testimonial.author_name || 'Author'}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 font-semibold">
                                        {getInitials(testimonial.author_name)}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 truncate">
                                        {testimonial.author_name || 'Anonymous'}
                                    </h3>
                                    <p className="text-sm text-gray-500 truncate">
                                        {testimonial.author_title || 'Customer'}
                                        {testimonial.author_company && ` at ${testimonial.author_company}`}
                                    </p>
                                </div>
                            </div>

                            {/* Testimonial Content */}
                            <p className="text-gray-700 text-sm leading-relaxed line-clamp-4 mb-4">
                                "{testimonial.content_text}"
                            </p>

                            {/* Tags */}
                            {testimonial.tags && testimonial.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {testimonial.tags.slice(0, 3).map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 text-xs font-medium bg-amber-500/10 text-amber-700 rounded-md"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Status Badge & Quality Score */}
                            <div className="flex items-center justify-between mb-4">
                                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${statusConfig[testimonial.status].className}`}>
                                    {statusConfig[testimonial.status].label}
                                </span>
                                {testimonial.quality_score !== null && (
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                        <span>{testimonial.quality_score.toFixed(1)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                {testimonial.status !== 'approved' && (
                                    <button
                                        onClick={() => handleApprove(testimonial.id)}
                                        disabled={updateStatus.isPending}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                    >
                                        <Check className="w-4 h-4" />
                                        Approve
                                    </button>
                                )}
                                {testimonial.status !== 'archived' && (
                                    <button
                                        onClick={() => handleArchive(testimonial.id)}
                                        disabled={updateStatus.isPending}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-500/10 text-gray-600 hover:bg-gray-500/20 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                    >
                                        <Archive className="w-4 h-4" />
                                        Archive
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(testimonial.id)}
                                    disabled={deleteTestimonial.isPending}
                                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                                        deleteConfirmId === testimonial.id
                                            ? 'bg-red-500 text-white hover:bg-red-600'
                                            : 'bg-red-500/10 text-red-600 hover:bg-red-500/20'
                                    }`}
                                >
                                    <Trash2 className="w-4 h-4" />
                                    {deleteConfirmId === testimonial.id ? 'Confirm' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && (!testimonials || testimonials.length === 0) && (
                <div className="bg-molt-surface/50 border border-border rounded-xl p-12 text-center">
                    <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <MessageSquareQuote className="w-8 h-8 text-amber-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                        {statusFilter !== 'all' ? `No ${statusFilter} testimonials` : 'No testimonials yet'}
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        {statusFilter !== 'all'
                            ? `There are no testimonials with "${statusFilter}" status. Try a different filter.`
                            : 'Start collecting testimonials from your customers to showcase social proof on your website.'}
                    </p>
                    {statusFilter === 'all' && (
                        <button className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors">
                            <Plus className="w-5 h-5" />
                            Add Your First Testimonial
                        </button>
                    )}
                </div>
            )}
        </DashboardLayout>
    )
}
