import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  asChild?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  asChild = false,
  ...props
}: ButtonProps) {
  const baseStyles = 'btn'
  
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  }
  
  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 py-2',
    lg: 'h-11 px-8',
  }
  
  const classes = cn(baseStyles, variants[variant], sizes[size], className)
  
  if (asChild) {
    return (
      <span className={classes}>
        {children}
      </span>
    )
  }
  
  return (
    <button
      className={classes}
      {...props}
    >
      {children}
    </button>
  )
}