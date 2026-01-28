import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
    size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        const variants = {
            primary: 'bg-primary text-primary-foreground hover:opacity-90',
            secondary: 'bg-secondary text-secondary-foreground hover:bg-stone-200',
            ghost: 'bg-transparent hover:bg-stone-100 text-foreground',
            outline: 'bg-transparent border border-border hover:bg-stone-50 text-foreground',
        }

        const sizes = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-6 py-2.5',
            lg: 'px-8 py-4 text-lg',
        }

        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center rounded-xl font-semibold transition-all active:scale-[0.98]',
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            />
        )
    }
)

Button.displayName = 'Button'

export { Button }
