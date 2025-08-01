import { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  actions?: ReactNode
  breadcrumbs?: { name: string; href?: string }[]
}

export default function PageHeader({ 
  title, 
  subtitle, 
  icon, 
  actions, 
  breadcrumbs 
}: PageHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        {breadcrumbs && (
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />}
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-blue-600 transition-colors">
                    {crumb.name}
                  </a>
                ) : (
                  <span className="text-gray-900 font-medium">{crumb.name}</span>
                )}
              </div>
            ))}
          </nav>
        )}

        {/* Header Content */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {icon && (
              <div className="p-3 bg-blue-100 rounded-xl mr-4">
                {icon}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          
          {actions && (
            <div className="flex items-center space-x-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
