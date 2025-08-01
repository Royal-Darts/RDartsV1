interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    label: string
    isPositive: boolean
  }
  icon?: React.ReactNode
}

export default function StatCard({ title, value, subtitle, trend, icon }: StatCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-lg font-medium text-gray-900">
                {value}
              </dd>
              {subtitle && (
                <dd className="text-sm text-gray-500">
                  {subtitle}
                </dd>
              )}
            </dl>
          </div>
        </div>
        {trend && (
          <div className="mt-5">
            <div className="flex items-center">
              <div className={`text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
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
