/**
 * AddTestimonialModal Component
 * Following Skill.md React Component Standards
 * 
 * Modal for creating new testimonials with form validation.
 * Supports text testimonials with author information.
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { X, Loader2, Star } from 'lucide-react'
import type { Database } from '../../types/database'

type TestimonialSource = Database['public']['Enums']['testimonial_source']

interface AddTestimonialModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: TestimonialFormData) => Promise<void>
  isSubmitting: boolean
}

export interface TestimonialFormData {
  content_text: string
  author_name: string
  author_title: string | null
  author_company: string | null
  author_email: string | null
  author_avatar: string | null
  source: TestimonialSource
  rating: number | null
}

interface FormErrors {
  content_text?: string
  author_name?: string
  author_email?: string
  general?: string
}

const initialFormData: TestimonialFormData = {
  content_text: '',
  author_name: '',
  author_title: null,
  author_company: null,
  author_email: null,
  author_avatar: null,
  source: 'direct',
  rating: null,
}

export function AddTestimonialModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: AddTestimonialModalProps) {
  const [formData, setFormData] = useState<TestimonialFormData>(initialFormData)
  const [errors, setErrors] = useState<FormErrors>({})
  const [hoveredStar, setHoveredStar] = useState<number | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const firstInputRef = useRef<HTMLTextAreaElement>(null)

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData)
      setErrors({})
    }
  }, [isOpen])

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      firstInputRef.current.focus()
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Trap focus within modal
  useEffect(() => {
    if (!isOpen) return

    const modal = modalRef.current
    if (!modal) return

    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }

    document.addEventListener('keydown', handleTab)
    return () => document.removeEventListener('keydown', handleTab)
  }, [isOpen])

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.content_text.trim()) {
      newErrors.content_text = 'Testimonial content is required'
    } else if (formData.content_text.trim().length < 10) {
      newErrors.content_text = 'Testimonial must be at least 10 characters'
    } else if (formData.content_text.length > 2000) {
      newErrors.content_text = 'Testimonial must be under 2000 characters'
    }

    if (!formData.author_name.trim()) {
      newErrors.author_name = 'Author name is required'
    } else if (formData.author_name.length > 100) {
      newErrors.author_name = 'Name must be under 100 characters'
    }

    if (formData.author_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.author_email)) {
      newErrors.author_email = 'Please enter a valid email'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to create testimonial',
      })
    }
  }, [formData, validateForm, onSubmit, onClose])

  const handleInputChange = useCallback((
    field: keyof TestimonialFormData,
    value: string | number | null
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user types
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }, [errors])

  const handleRatingClick = useCallback((rating: number) => {
    setFormData(prev => ({
      ...prev,
      rating: prev.rating === rating ? null : rating,
    }))
  }, [])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 id="modal-title" className="text-xl font-bold text-gray-900">
            Add Testimonial
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* General Error */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm" role="alert">
              {errors.general}
            </div>
          )}

          {/* Testimonial Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1.5">
              Testimonial <span className="text-red-500">*</span>
            </label>
            <textarea
              ref={firstInputRef}
              id="content"
              value={formData.content_text}
              onChange={(e) => handleInputChange('content_text', e.target.value)}
              placeholder="Share what you love about the product..."
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none ${
                errors.content_text ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            <div className="flex justify-between mt-1">
              {errors.content_text && (
                <p className="text-red-600 text-sm">{errors.content_text}</p>
              )}
              <p className="text-gray-400 text-xs ml-auto">
                {formData.content_text.length}/2000
              </p>
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Rating (optional)
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(null)}
                  aria-label={`Rate ${star} stars`}
                  className="p-1 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      star <= (hoveredStar ?? formData.rating ?? 0)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-200 fill-gray-200'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Author Name */}
          <div>
            <label htmlFor="author_name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="author_name"
              value={formData.author_name}
              onChange={(e) => handleInputChange('author_name', e.target.value)}
              placeholder="John Doe"
              className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                errors.author_name ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.author_name && (
              <p className="text-red-600 text-sm mt-1">{errors.author_name}</p>
            )}
          </div>

          {/* Author Title & Company (side by side) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="author_title" className="block text-sm font-medium text-gray-700 mb-1.5">
                Job Title
              </label>
              <input
                type="text"
                id="author_title"
                value={formData.author_title || ''}
                onChange={(e) => handleInputChange('author_title', e.target.value || null)}
                placeholder="CEO"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label htmlFor="author_company" className="block text-sm font-medium text-gray-700 mb-1.5">
                Company
              </label>
              <input
                type="text"
                id="author_company"
                value={formData.author_company || ''}
                onChange={(e) => handleInputChange('author_company', e.target.value || null)}
                placeholder="Acme Inc."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Author Email */}
          <div>
            <label htmlFor="author_email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email (for verification, not displayed)
            </label>
            <input
              type="email"
              id="author_email"
              value={formData.author_email || ''}
              onChange={(e) => handleInputChange('author_email', e.target.value || null)}
              placeholder="john@example.com"
              className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                errors.author_email ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.author_email && (
              <p className="text-red-600 text-sm mt-1">{errors.author_email}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Add Testimonial'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
