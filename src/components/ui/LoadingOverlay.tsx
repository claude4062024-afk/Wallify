import { Loader2 } from 'lucide-react'

interface LoadingOverlayProps {
    message?: string
    fullScreen?: boolean
}

/**
 * Professional loading overlay component
 * Shows a centered spinner with optional message
 */
export function LoadingOverlay({ message = 'Loading...', fullScreen = false }: LoadingOverlayProps) {
    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">{message}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center py-20">
            <div className="text-center">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">{message}</p>
            </div>
        </div>
    )
}

/**
 * Inline loading indicator for refetching states
 */
export function RefetchingIndicator() {
    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full">
            <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
            <span className="text-sm font-medium text-gray-700">Updating...</span>
        </div>
    )
}

/**
 * Skeleton loader for content placeholders
 */
interface SkeletonProps {
    className?: string
    count?: number
}

export function Skeleton({ className = '', count = 1 }: SkeletonProps) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className={`animate-pulse bg-gray-200 rounded ${className}`}
                />
            ))}
        </>
    )
}
