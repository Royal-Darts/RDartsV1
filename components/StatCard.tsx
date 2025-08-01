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
}

export default function StatCard({ title, value, subtitle, trend, icon, className = "" }: StatCardProps) {
  return (
    <div className={`bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${className}`}>
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              {icon}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-2xl font-bold text-gray-900">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </dd>
              {subtitle && (
                <dd className="text-sm text-gray-600">
                  {subtitle}
                </dd>
              )}
            </dl>
          </div>
        </div>
        {trend && (
          <div className="mt-4">
            <div className="flex items-center">
              <div className={`flex items-center text-sm font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                <span className={`mr-1 ${trend.isPositive ? '↗️' : '↘️'}`}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              </div>
              <div className="text-sm text-gray-500 ml-2">
                {trend.label}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
