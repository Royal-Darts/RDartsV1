import { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    label: string
    isPositive: boolean
  }
  icon?: ReactNode
  className?: string
  variant?: 'default' | 'gradient' | 'minimal'
}

export default function StatCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  icon, 
  className = "",
  variant = 'default'
}: StatCardProps) {
  
  const baseClasses = "relative overflow-hidden transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
  
  const variantClasses = {
    default: "bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-2xl shadow-lg",
    gradient: "bg-gradient-to-br from-white to-slate-50 border border-slate-200/50 rounded-2xl shadow-lg",
    minimal: "bg-white/60 backdrop-blur-md border border-white/20 rounded-2xl shadow-sm"
  }

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-amber-500/5 rounded-2xl"></div>
      
      <div className="relative p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <dl>
              <dt className="text-sm font-medium text-slate-600 truncate mb-1">
                {title}
              </dt>
              <dd className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent truncate">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </dd>
              {subtitle && (
                <dd className="text-sm text-slate-500 mt-1 truncate">
                  {subtitle}
                </dd>
              )}
            </dl>
          </div>
          
          {icon && (
            <div className="flex-shrink-0 ml-4">
              <div className="p-3 bg-gradient-to-br from-blue-500/10 to-amber-500/10 rounded-xl">
                {icon}
              </div>
            </div>
          )}
        </div>
        
        {trend && (
          <div className="mt-4 pt-4 border-t border-slate-200/50">
            <div className="flex items-center justify-between">
              <div className={`flex items-center text-sm font-medium ${
                trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                <span className={`mr-1 text-lg ${trend.isPositive ? '↗️' : '↘️'}`}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              </div>
              <div className="text-sm text-slate-500 truncate ml-2">
                {trend.label}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
