'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'outline' | 'destructive' | 'ghost'

type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-green-700 text-white hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-700',
  outline:
    'border border-green-200 bg-white hover:bg-green-100 dark:border-green-700 dark:bg-green-900 dark:hover:bg-green-800 text-green-900 dark:text-green-100',
  destructive:
    'bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600',
  ghost: 'hover:bg-green-100 dark:hover:bg-green-800 text-green-900 dark:text-green-100',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 rounded-md text-sm',
  md: 'h-10 px-4 py-2 rounded-md',
  lg: 'h-11 px-8 rounded-md text-base',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'outline', size = 'md', ...props },
    ref
  ) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
