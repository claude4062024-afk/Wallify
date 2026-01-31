/**
 * TestimonialCard Component
 * Following Skill.md React Component Standards
 * 
 * Displays a single testimonial with author info, content, and action buttons.
 * Supports approve, archive, delete actions with accessible controls.
 */

import React, { useCallback } from 'react'
import { Check, Archive, Trash2, Star, ExternalLink, Twitter, Linkedin, MessageSquare } from 'lucide-react'
import type { Database } from '../../types/database'

type Testimonial = Database['public']['Tables']['testimonials']['Row']
type TestimonialStatus = Database['public']['Enums']['testimonial_status']

interface TestimonialCardProps {
  testimonial: Testimonial
  onApprove: (id: string) => void
  onArchive: (id: string) => void
  onDelete: (id: string) => void
  showActions?: boolean
  isDeleting?: boolean
  deleteConfirmId?: string | null
  onDeleteConfirm?: (id: string | null) => void
}

const statusConfig: Record<TestimonialStatus, { label: string; className: string }> = {
  approved: { label: 'Approved', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  pending: { label: 'Pending', className: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
  archived: { label: 'Archived', className: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
  rejected: { label: 'Rejected', className: 'bg-red-500/10 text-red-600 border-red-500/20' },
}

const sourceIcons: Record<string, typeof Twitter> = {
  twitter: Twitter,
  linkedin: Linkedin,
  direct: MessageSquare,
}

function getInitials(name: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getQualityColor(score: number | null): string {
  if (score === null) return 'text-gray-400'
  if (score >= 0.8) return 'text-emerald-500'
  if (score >= 0.5) return 'text-amber-500'
  return 'text-red-500'
}

export const TestimonialCard = React.memo(function TestimonialCard({
  testimonial,
  onApprove,
  onArchive,
  onDelete,
  showActions = true,
  isDeleting = false,
  deleteConfirmId,
  onDeleteConfirm,
}: TestimonialCardProps) {
  const statusInfo = statusConfig[testimonial.status]
  const SourceIcon = sourceIcons[testimonial.source || 'direct'] || MessageSquare
  const isDeleteConfirming = deleteConfirmId === testimonial.id

  const handleApprove = useCallback(() => {
    onApprove(testimonial.id)
  }, [testimonial.id, onApprove])

  const handleArchive = useCallback(() => {
    onArchive(testimonial.id)
  }, [testimonial.id, onArchive])

  const handleDelete = useCallback(() => {
    if (isDeleteConfirming) {
      onDelete(testimonial.id)
      onDeleteConfirm?.(null)
    } else {
      onDeleteConfirm?.(testimonial.id)
      // Auto-reset after 3 seconds
      setTimeout(() => onDeleteConfirm?.(null), 3000)
    }
  }, [testimonial.id, isDeleteConfirming, onDelete, onDeleteConfirm])

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
      {/* Author Info */}
      <div className="flex items-start gap-3 mb-4">
        {testimonial.author_avatar ? (
          <img
            src={testimonial.author_avatar}
            alt={testimonial.author_name || 'Author'}
            loading="lazy"
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
        {/* Source Icon */}
        <div className="flex items-center gap-1.5">
          <SourceIcon className="w-4 h-4 text-gray-400" aria-label={`Source: ${testimonial.source}`} />
        </div>
      </div>

      {/* Star Rating */}
      {testimonial.rating && (
        <div className="flex items-center gap-0.5 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < (testimonial.rating || 0)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-gray-200 fill-gray-200'
              }`}
            />
          ))}
        </div>
      )}

      {/* Testimonial Content */}
      <p className="text-gray-700 text-sm leading-relaxed line-clamp-4 mb-4">
        "{testimonial.content_text}"
      </p>

      {/* Tags */}
      {testimonial.tags && testimonial.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {testimonial.tags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {testimonial.tags.length > 3 && (
            <span className="px-2 py-0.5 text-gray-400 text-xs">
              +{testimonial.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Meta Row */}
      <div className="flex items-center justify-between gap-2 mb-4">
        {/* Status Badge */}
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo.className}`}
        >
          {statusInfo.label}
        </span>

        {/* Quality Score */}
        {testimonial.quality_score !== null && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400">Quality:</span>
            <span className={`text-xs font-medium ${getQualityColor(testimonial.quality_score)}`}>
              {Math.round((testimonial.quality_score || 0) * 100)}%
            </span>
          </div>
        )}

        {/* Date */}
        <span className="text-xs text-gray-400">
          {formatDate(testimonial.created_at)}
        </span>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          {testimonial.status !== 'approved' && (
            <button
              onClick={handleApprove}
              aria-label="Approve testimonial"
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <Check className="w-4 h-4" />
              Approve
            </button>
          )}
          {testimonial.status !== 'archived' && (
            <button
              onClick={handleArchive}
              aria-label="Archive testimonial"
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <Archive className="w-4 h-4" />
              Archive
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label={isDeleteConfirming ? 'Confirm delete' : 'Delete testimonial'}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
              isDeleteConfirming
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            } disabled:opacity-50`}
          >
            <Trash2 className="w-4 h-4" />
            {isDeleteConfirming ? 'Confirm' : 'Delete'}
          </button>
        </div>
      )}

      {/* External Link (if source URL exists) */}
      {testimonial.source_url && (
        <a
          href={testimonial.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 mt-3 px-3 py-2 text-gray-500 hover:text-gray-700 text-sm transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          View Original
        </a>
      )}
    </div>
  )
})
