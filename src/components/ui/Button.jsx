import React from 'react'
import { cn } from '../../lib/utils'

const buttonVariants = {
  default: "bg-orange-600 text-white hover:bg-orange-700",
  destructive: "bg-red-600 text-white hover:bg-red-700",
  outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
  secondary: "bg-blue-600 text-white hover:bg-blue-700",
  ghost: "text-gray-700 hover:bg-gray-100",
  link: "text-orange-600 underline-offset-4 hover:underline"
}

const buttonSizes = {
  sm: "h-9 px-3 text-sm",
  default: "h-10 px-4 py-2",
  lg: "h-11 px-8 text-lg",
  icon: "h-10 w-10"
}

export const Button = React.forwardRef(({ 
  className, 
  variant = 'default', 
  size = 'default', 
  disabled = false,
  loading = false,
  children,
  ...props 
}, ref) => {
  const buttonClass = cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-105 active:scale-95",
    buttonVariants[variant],
    buttonSizes[size],
    className
  )

  return (
    <button
      className={buttonClass}
      ref={ref}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
          <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
      )}
      {children}
    </button>
  )
})

Button.displayName = "Button"
