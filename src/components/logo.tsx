import { cn } from '@/lib/utils'

export const Logo = ({ className }: { className?: string }) => {
    return (
        <span className={cn('text-foreground text-base font-semibold tracking-tight', className)}>
            Wallify
        </span>
    )
}

export const LogoIcon = ({ className }: { className?: string }) => {
    return (
        <span className={cn('text-foreground text-sm font-semibold', className)}>
            W
        </span>
    )
}
